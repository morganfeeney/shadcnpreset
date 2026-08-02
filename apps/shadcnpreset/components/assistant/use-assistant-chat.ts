"use client"

import * as React from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { usePathname } from "next/navigation"

import { writePendingAssistantPrompt } from "@/lib/pending-assistant-prompt"
import { trackEvent } from "@/lib/analytics-events"
import type { AssistantTurn } from "@/lib/search/assistant/schema"
import { useAuthStore } from "@/stores/auth-store"

export type ChatMessage =
  | {
      role: "user"
      content: string
    }
  | {
      role: "assistant"
      content: string
      kind: "text"
      followUpQuestions?: string[]
    }
  | {
      role: "assistant"
      kind: "presets"
      content: string
      presets: Extract<AssistantTurn, { phase: "ready" }>["presets"]
    }

export type AssistantChatListItem = {
  id: string
  title: string
  createdAt: number
  updatedAt: number
}

type AssistantChatDetailResponse = {
  chat?: {
    id: string
    messages: Array<{
      role: "user" | "assistant"
      kind: "text" | "presets"
      content: string
      presets?: Extract<ChatMessage, { role: "assistant"; kind: "presets" }>["presets"]
      followUpQuestions?: string[]
    }>
  }
}

type AssistantSendResponse =
  | (AssistantTurn & { chatId?: string })
  | { error?: string; code?: string; chatId?: string }

function hydrateMessages(
  messages: NonNullable<AssistantChatDetailResponse["chat"]>["messages"]
): ChatMessage[] {
  const hydrated: ChatMessage[] = []

  for (const message of messages) {
    if (message.role === "user") {
      hydrated.push({ role: "user", content: message.content })
      continue
    }

    if (message.kind === "presets" && Array.isArray(message.presets)) {
      hydrated.push({
        role: "assistant",
        kind: "presets",
        content: message.content,
        presets: message.presets,
      })
      continue
    }

    hydrated.push({
      role: "assistant",
      kind: "text",
      content: message.content,
      followUpQuestions:
        message.kind === "text" && Array.isArray(message.followUpQuestions)
          ? message.followUpQuestions.filter((q) => q.trim().length > 0).slice(0, 4)
          : undefined,
    })
  }

  return hydrated
}

function getLastTurnFromMessages(messages: ChatMessage[]): AssistantTurn | null {
  const latestAssistant = [...messages]
    .reverse()
    .find(
      (
        message
      ): message is Extract<ChatMessage, { role: "assistant"; kind: "text" }> =>
        message.role === "assistant" && message.kind === "text"
    )

  if (!latestAssistant?.followUpQuestions?.length) {
    return null
  }

  return {
    phase: "gathering",
    assistantMessage: latestAssistant.content,
    followUpQuestions: latestAssistant.followUpQuestions,
  }
}

class AssistantSendError extends Error {
  readonly errorType: string

  constructor(message: string, errorType: string) {
    super(message)
    this.name = "AssistantSendError"
    this.errorType = errorType
  }
}

export function useAssistantChat() {
  const pathname = usePathname()
  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [pending, setPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [lastTurn, setLastTurn] = React.useState<AssistantTurn | null>(null)
  const [activeChatId, setActiveChatId] = React.useState<string | null>(null)
  const [deletingChatId, setDeletingChatId] = React.useState<string | null>(null)
  const [composerResetKey, setComposerResetKey] = React.useState(0)
  const authStatus = useAuthStore((state) => state.status)
  const ensureAuthenticated = useAuthStore((state) => state.ensureAuthenticated)
  const queryClient = useQueryClient()
  const [syncedAuthStatus, setSyncedAuthStatus] = React.useState(authStatus)
  const [syncedActiveChatId, setSyncedActiveChatId] = React.useState(activeChatId)
  const [syncedChatData, setSyncedChatData] = React.useState<
    AssistantChatDetailResponse["chat"] | undefined
  >(undefined)

  const hasInteracted = messages.some((message) => message.role === "user")
  const requiresAuth = authStatus !== "authenticated"

  const resetComposer = React.useCallback(() => {
    setComposerResetKey((key) => key + 1)
  }, [])

  const recentChatsQuery = useQuery<AssistantChatListItem[], Error>({
    queryKey: ["assistantChats", authStatus],
    enabled: authStatus === "authenticated",
    queryFn: async (): Promise<AssistantChatListItem[]> => {
      const response = await fetch("/api/assistant/chats")
      const payload = (await response.json()) as {
        chats?: AssistantChatListItem[]
      }
      if (!response.ok) {
        throw new Error("Failed to load chats")
      }
      return Array.isArray(payload.chats) ? payload.chats : []
    },
  })

  const activeChatQuery = useQuery<
    AssistantChatDetailResponse["chat"],
    Error
  >({
    queryKey: ["assistantChat", activeChatId],
    enabled: authStatus === "authenticated" && Boolean(activeChatId),
    queryFn: async (): Promise<AssistantChatDetailResponse["chat"]> => {
      const response = await fetch(`/api/assistant/chats/${activeChatId}`)
      const payload = (await response.json()) as AssistantChatDetailResponse
      if (!response.ok || !payload.chat) {
        throw new Error("Could not load this chat. Try again.")
      }
      return payload.chat
    },
  })

  const recentChats = recentChatsQuery.data ?? []
  const isLoadingRecentChats = recentChatsQuery.isLoading
  const chatLoadError = activeChatQuery.isError
    ? "Could not load this chat. Try again."
    : null

  // Adjust local chat state while rendering when auth/query inputs change.
  // https://react.dev/learn/you-might-not-need-an-effect
  if (authStatus !== syncedAuthStatus) {
    setSyncedAuthStatus(authStatus)
    if (authStatus !== "authenticated") {
      setMessages([])
      setActiveChatId(null)
      setLastTurn(null)
      setSyncedActiveChatId(null)
      setSyncedChatData(undefined)
    }
  } else if (activeChatId !== syncedActiveChatId) {
    setSyncedActiveChatId(activeChatId)
    setSyncedChatData(undefined)
  } else if (
    authStatus === "authenticated" &&
    activeChatQuery.data !== syncedChatData
  ) {
    setSyncedChatData(activeChatQuery.data)
    if (activeChatQuery.data) {
      const hydrated = hydrateMessages(activeChatQuery.data.messages)
      setMessages(hydrated)
      setLastTurn(getLastTurnFromMessages(hydrated))
      setComposerResetKey((key) => key + 1)
      setError(null)
    }
  }

  type SendVars = {
    trimmed: string
    nextMessages: ChatMessage[]
    previousPresetCodes: string[]
    chatId: string | null
  }

  type SendData =
    | {
        kind: "ok"
        response: Response
        data: Extract<AssistantSendResponse, { phase: string }>
        args: SendVars
      }
    | {
        kind: "auth_required"
        args: SendVars
      }

  type SendContext = {
    previousMessages: ChatMessage[]
    requestStartedAt: number
  }

  const sendMutation = useMutation<SendData, Error, SendVars, SendContext>({
    mutationFn: async (args: {
      trimmed: string
      nextMessages: ChatMessage[]
      previousPresetCodes: string[]
      chatId: string | null
    }) => {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: args.chatId ?? undefined,
          messages: args.nextMessages,
          previousPresetCodes: args.previousPresetCodes,
        }),
      })
      const raw = await response.text()
      let parsedData: unknown = {}
      try {
        parsedData = raw ? JSON.parse(raw) : {}
      } catch {
        parsedData = {}
      }
      const data = parsedData as AssistantSendResponse

      if (
        response.status === 401 &&
        "code" in data &&
        data.code === "auth_required"
      ) {
        return { kind: "auth_required", args }
      }

      if (!response.ok) {
        throw new AssistantSendError(
          "error" in data && typeof data.error === "string"
            ? data.error
            : `Request failed (${response.status}) — try again.`,
          `http_${response.status}`
        )
      }

      if (!("phase" in data)) {
        throw new AssistantSendError(
          "Unexpected response — try again.",
          "unexpected_payload"
        )
      }

      return { kind: "ok", response, data, args }
    },
    onMutate: async (args) => {
      setError(null)
      setPending(true)
      setLastTurn(null)
      const previousMessages = messages
      setMessages(args.nextMessages)
      return { previousMessages, requestStartedAt: Date.now() }
    },
    onSuccess: async (result, _variables, context) => {
      if (result.kind === "auth_required") {
        setMessages(context?.previousMessages ?? [])
        await ensureAuthenticated()
        return
      }

      const latencyMs = context
        ? Math.max(0, Date.now() - context.requestStartedAt)
        : 0
      const { data } = result
      trackEvent("ai_assistant_response_success", {
        page_path: pathname,
        latency_ms: latencyMs,
      })

      if (typeof data.chatId === "string") {
        setActiveChatId(data.chatId)
        await queryClient.invalidateQueries({ queryKey: ["assistantChats"] })
        await queryClient.invalidateQueries({
          queryKey: ["assistantChat", data.chatId],
        })
      }

      if (data.phase === "ready") {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            kind: "presets",
            content: data.assistantMessage,
            presets: data.presets,
          },
        ])
        setLastTurn(null)
        return
      }

      setLastTurn(data)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          kind: "text",
          content: data.assistantMessage,
          followUpQuestions: data.followUpQuestions,
        },
      ])
    },
    onError: (error, _vars, context) => {
      const latencyMs = context
        ? Math.max(0, Date.now() - context.requestStartedAt)
        : undefined
      const isSendError = error instanceof AssistantSendError
      trackEvent("ai_assistant_response_error", {
        page_path: pathname,
        ...(latencyMs !== undefined ? { latency_ms: latencyMs } : {}),
        error_type: isSendError ? error.errorType : "network_error",
      })
      setMessages(context?.previousMessages ?? [])
      setError(isSendError ? error.message : "Network error — try again.")
    },
    onSettled: () => {
      setPending(false)
    },
  })

  async function deleteChat(chatId: string) {
    const trimmedId = chatId.trim()
    if (!trimmedId || pending || deletingChatId) return

    setDeletingChatId(trimmedId)
    setError(null)
    try {
      const response = await fetch(`/api/assistant/chats/${trimmedId}`, {
        method: "DELETE",
      })
      const payload = (await response.json()) as {
        error?: string
        code?: string
      }

      if (!response.ok) {
        setError(payload.error ?? "Could not delete chat. Try again.")
        return
      }

      if (activeChatId === trimmedId) {
        setActiveChatId(null)
        setMessages([])
        setLastTurn(null)
        resetComposer()
      }

      await queryClient.invalidateQueries({ queryKey: ["assistantChats"] })
      await queryClient.invalidateQueries({
        queryKey: ["assistantChat", trimmedId],
      })
    } catch {
      setError("Network error — try again.")
    } finally {
      setDeletingChatId(null)
    }
  }

  async function sendContent(text: string) {
    const trimmed = text.trim()
    if (!trimmed || pending) return
    const hasPreviousUserMessage = messages.some((message) => message.role === "user")
    trackEvent("ai_assistant_prompt_submit", {
      page_path: pathname,
      assistant_prompt: trimmed,
      prompt_length: trimmed.length,
      intent: hasPreviousUserMessage ? "preset_refinement" : "preset_discovery",
    })

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: trimmed }]
    const previousPresetMessage = [...messages]
      .reverse()
      .find(
        (
          message
        ): message is Extract<ChatMessage, { role: "assistant"; kind: "presets" }> =>
          message.role === "assistant" &&
          message.kind === "presets" &&
          Boolean(message.presets?.length)
      )
    const previousPresetCodes = previousPresetMessage?.presets?.map((p) => p.code) ?? []

    const result = await sendMutation.mutateAsync({
      trimmed,
      nextMessages,
      previousPresetCodes,
      chatId: activeChatId,
    })

    if (result.kind === "auth_required") {
      throw new AssistantSendError(
        "Authentication required",
        "auth_required"
      )
    }
  }

  async function onPromptSubmit(text: string) {
    if (requiresAuth) {
      writePendingAssistantPrompt(text)
      await ensureAuthenticated()
      return
    }
    await sendContent(text)
  }

  function startNewChat() {
    if (pending) {
      return
    }
    setActiveChatId(null)
    setMessages([])
    resetComposer()
    setError(null)
    setLastTurn(null)
  }

  return {
    activeChatId,
    activeChatQuery,
    composerResetKey,
    deletingChatId,
    deleteChat,
    error: error ?? chatLoadError,
    hasInteracted,
    lastTurn,
    messages,
    pending,
    recentChats,
    isLoadingRecentChats,
    setActiveChatId,
    sendContent,
    onPromptSubmit,
    startNewChat,
  }
}
