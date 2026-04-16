"use client"

import * as React from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  clearPendingAssistantPrompt,
  readPendingAssistantPrompt,
  writePendingAssistantPrompt,
} from "@/lib/pending-assistant-prompt"
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
    }>
  }
}

type AssistantSendResponse =
  | (AssistantTurn & { chatId?: string })
  | { error?: string; code?: string; chatId?: string }

function hydrateMessages(
  messages: NonNullable<AssistantChatDetailResponse["chat"]>["messages"]
): ChatMessage[] {
  return messages.flatMap((message) => {
    if (message.role === "user") {
      return [{ role: "user", content: message.content }]
    }
    if (message.kind === "presets" && Array.isArray(message.presets)) {
      return [
        {
          role: "assistant",
          kind: "presets",
          content: message.content,
          presets: message.presets,
        },
      ]
    }
    return [{ role: "assistant", kind: "text", content: message.content }]
  })
}

export function useAssistantChat() {
  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [input, setInput] = React.useState("")
  const [pending, setPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [lastTurn, setLastTurn] = React.useState<AssistantTurn | null>(null)
  const [activeChatId, setActiveChatId] = React.useState<string | null>(null)
  const authStatus = useAuthStore((state) => state.status)
  const ensureAuthenticated = useAuthStore((state) => state.ensureAuthenticated)
  const queryClient = useQueryClient()

  const hasInteracted = messages.some((message) => message.role === "user")
  const requiresAuth = authStatus !== "authenticated"

  const recentChatsQuery = useQuery({
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

  const activeChatQuery = useQuery({
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

  React.useEffect(() => {
    const pendingPrompt = readPendingAssistantPrompt()
    if (!pendingPrompt) {
      return
    }
    setInput((current) => (current.trim().length ? current : pendingPrompt))
    clearPendingAssistantPrompt()
  }, [])

  React.useEffect(() => {
    if (authStatus !== "authenticated") {
      setMessages([])
      setActiveChatId(null)
    }
  }, [authStatus])

  React.useEffect(() => {
    if (activeChatQuery.isError) {
      setError("Could not load this chat. Try again.")
    }
  }, [activeChatQuery.isError])

  React.useEffect(() => {
    const chat = activeChatQuery.data
    if (!chat) {
      return
    }
    setMessages(hydrateMessages(chat.messages))
    setLastTurn(null)
    setInput("")
    setError(null)
  }, [activeChatQuery.data])

  const sendMutation = useMutation({
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
      return { response, data: parsedData as AssistantSendResponse, args }
    },
    onMutate: async (args) => {
      setError(null)
      setPending(true)
      setLastTurn(null)
      setInput("")
      const previousMessages = messages
      setMessages(args.nextMessages)
      return { previousMessages, previousInput: input }
    },
    onSuccess: async ({ response, data, args }, context) => {
      if (
        response.status === 401 &&
        "code" in data &&
        data.code === "auth_required"
      ) {
        setMessages(context?.previousMessages ?? [])
        setInput(args.trimmed)
        await ensureAuthenticated()
        return
      }

      if (!response.ok) {
        setMessages(context?.previousMessages ?? [])
        setInput(args.trimmed)
        setError(
          "error" in data && typeof data.error === "string"
            ? data.error
            : `Request failed (${response.status}) — try again.`
        )
        return
      }

      if (!("phase" in data)) {
        setMessages(context?.previousMessages ?? [])
        setInput(args.trimmed)
        setError("Unexpected response — try again.")
        return
      }

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
        },
      ])
    },
    onError: (_error, _vars, context) => {
      setMessages(context?.previousMessages ?? [])
      setInput(context?.previousInput ?? "")
      setError("Network error — try again.")
    },
    onSettled: () => {
      setPending(false)
    },
  })

  async function sendContent(text: string) {
    const trimmed = text.trim()
    if (!trimmed || pending) return

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

    await sendMutation.mutateAsync({
      trimmed,
      nextMessages,
      previousPresetCodes,
      chatId: activeChatId,
    })
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
    setInput("")
    setError(null)
    setLastTurn(null)
  }

  return {
    activeChatId,
    activeChatQuery,
    error,
    hasInteracted,
    input,
    lastTurn,
    messages,
    pending,
    recentChatsQuery,
    setActiveChatId,
    setInput,
    sendContent,
    onPromptSubmit,
    startNewChat,
  }
}
