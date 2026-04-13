"use client"

import Link from "next/link"
import * as React from "react"
import {
  CompassIcon,
  HomeIcon,
  SparklesIcon,
  WandSparklesIcon,
} from "lucide-react"

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation"
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message"
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input"
import { Shimmer } from "@/components/ai-elements/shimmer"
import { PresetIframeCard } from "@/components/preset-iframe-card"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"
import type { AssistantTurn } from "@/lib/search/assistant/schema"
import { cn } from "@/lib/utils"

type ChatMessage = {
  role: "user" | "assistant"
  content: string
  presets?: Extract<AssistantTurn, { phase: "ready" }>["presets"]
}

export function AssistantChat() {
  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [input, setInput] = React.useState("")
  const [pending, setPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [lastTurn, setLastTurn] = React.useState<AssistantTurn | null>(null)
  const bottomRef = React.useRef<HTMLDivElement>(null)
  const hasInteracted = messages.some((message) => message.role === "user")

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, lastTurn, pending])

  async function sendContent(text: string) {
    const trimmed = text.trim()
    if (!trimmed || pending) return

    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: trimmed },
    ]
    setMessages(nextMessages)
    setInput("")
    setError(null)
    setPending(true)
    setLastTurn(null)

    const previousPresetCodes =
      [...messages]
        .reverse()
        .find((m) => m.role === "assistant" && m.presets?.length)
        ?.presets?.map((p) => p.code) ?? []

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages, previousPresetCodes }),
      })
      const data = (await res.json()) as AssistantTurn & { error?: string }

      if (!res.ok) {
        setError(
          typeof data.error === "string"
            ? data.error
            : `Request failed (${res.status}) — try again.`
        )
        return
      }

      if ("error" in data && typeof data.error === "string") {
        setError(data.error)
        return
      }

      if (!("phase" in data)) {
        setError("Unexpected response — try again.")
        return
      }

      if (data.phase === "ready") {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
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
        { role: "assistant", content: data.assistantMessage },
      ])
    } catch {
      setError("Network error — try again.")
    } finally {
      setPending(false)
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    void sendContent(input)
  }

  async function onPromptSubmit(message: PromptInputMessage) {
    await sendContent(message.text)
  }

  return (
    <SidebarProvider className="min-h-0 flex-1">
      <Sidebar
        collapsible="none"
        className="hidden border-r border-border/70 md:flex"
      >
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>New chat</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive>
                    <WandSparklesIcon />
                    AI preset finder
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Recent chats</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <SparklesIcon />
                    Minimal SaaS Landing
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <CompassIcon />
                    Dashboard explorer
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <div className="flex-1 pr-2 pb-2">
        <div className="mx-auto grid h-full w-full content-center gap-6 rounded-lg border px-4 py-6 md:px-6">
          <div
            className={cn(!hasInteracted && "grid items-center justify-center")}
          >
            <div className={cn("text-center", hasInteracted ? "pt-8" : "pt-0")}>
              <h1 className="text-3xl font-semibold tracking-tight text-balance md:text-4xl">
                Describe your ideal shadcn preset
              </h1>
              <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground">
                Use natural language, I will help you get what you want.
              </p>
            </div>

            {hasInteracted ? (
              <div className="mx-auto flex min-h-[min(52vh,540px)] w-full max-w-4xl flex-col rounded-2xl transition-all duration-300">
                <Conversation>
                  <ConversationContent className="gap-4 p-2 md:p-4">
                    {messages.map((m, i) => (
                      <Message from={m.role} key={`${i}-${m.role}`}>
                        <MessageContent>
                          <MessageResponse>{m.content}</MessageResponse>
                          {m.role === "assistant" && m.presets?.length ? (
                            <ul className="mt-3 grid gap-6 sm:grid-cols-2">
                              {m.presets.map((p, presetIndex) => (
                                <li key={`${i}-${presetIndex}-${p.code}`}>
                                  <PresetIframeCard
                                    code={p.code}
                                    title={p.code}
                                    description={p.description}
                                  />
                                </li>
                              ))}
                            </ul>
                          ) : null}
                        </MessageContent>
                      </Message>
                    ))}

                    {pending ? (
                      <Message from="assistant">
                        <MessageContent className="w-full max-w-md rounded-lg border border-border/60 bg-muted/20 p-3">
                          <Shimmer className="text-sm">
                            Generating preset candidates...
                          </Shimmer>
                          <div className="mt-3 grid gap-3 sm:grid-cols-2">
                            <div className="h-36 animate-pulse rounded-lg border border-border/60 bg-muted/30" />
                            <div className="h-36 animate-pulse rounded-lg border border-border/60 bg-muted/30" />
                          </div>
                        </MessageContent>
                      </Message>
                    ) : null}
                    <div ref={bottomRef} />
                  </ConversationContent>
                  <ConversationScrollButton />
                </Conversation>
              </div>
            ) : null}

            {lastTurn?.phase === "gathering" &&
            lastTurn.followUpQuestions.length ? (
              <div className="mx-auto w-full max-w-4xl space-y-2">
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Quick replies
                </p>
                <div className="flex flex-wrap gap-2">
                  {lastTurn.followUpQuestions.map((q) => (
                    <Button
                      key={q}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-auto max-w-full py-2 text-left text-xs whitespace-normal"
                      onClick={() => void sendContent(q)}
                      disabled={pending}
                    >
                      {q}
                    </Button>
                  ))}
                </div>
              </div>
            ) : null}

            {error ? (
              <p
                className="mx-auto w-full max-w-4xl text-sm text-destructive"
                role="alert"
              >
                {error}
              </p>
            ) : null}
          </div>

          <PromptInput
            onSubmit={onPromptSubmit}
            className={cn(
              "z-20 mx-auto w-full max-w-[690px] transition-all duration-300",
              hasInteracted ? "sticky bottom-0 mt-6 max-w-4xl rounded-xl" : ""
            )}
          >
            <PromptInputBody>
              <PromptInputTextarea
                rows={hasInteracted ? 3 : 2}
                placeholder={
                  hasInteracted ? "Reply to refine..." : "Ask AI to build..."
                }
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={pending}
                className="min-h-[88px] resize-y"
              />
            </PromptInputBody>
            <PromptInputFooter>
              <PromptInputTools>
                <Link
                  href="/"
                  className={buttonVariants({ variant: "ghost", size: "sm" })}
                >
                  <HomeIcon className="mr-1.5 size-4 opacity-70" />
                  Home
                </Link>
                {pending ? (
                  <Shimmer className="text-xs">Thinking...</Shimmer>
                ) : null}
              </PromptInputTools>
              <PromptInputSubmit
                status={pending ? "submitted" : "ready"}
                disabled={pending || !input.trim()}
              />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </SidebarProvider>
  )
}
