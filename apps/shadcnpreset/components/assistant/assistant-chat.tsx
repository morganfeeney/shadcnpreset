"use client"

import * as React from "react"
import { SquarePen } from "lucide-react"

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
import { Shimmer } from "@/components/ai-elements/shimmer"
import { AssistantChatProvider } from "@/components/assistant/assistant-chat-context"
import { AssistantPromptComposer } from "@/components/assistant/assistant-prompt-composer"
import { PresetStyleOverviewCard } from "@/components/preset-style-overview-card"
import { RecentChatsList } from "@/components/assistant/recent-chats-list"
import { Button } from "@/components/ui/button"
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
import { useAssistantChat } from "@/components/assistant/use-assistant-chat"
import { trackEvent } from "@/lib/analytics-events"
import { cn } from "@/lib/utils"

export function AssistantChat() {
  const chat = useAssistantChat()
  const {
    activeChatId,
    composerResetKey,
    error,
    hasInteracted,
    lastTurn,
    messages,
    onPromptSubmit,
    pending,
    sendContent,
    startNewChat,
  } = chat
  const bottomRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, lastTurn, pending])

  React.useEffect(() => {
    trackEvent("ai_assistant_open", { page_path: "/assistant" })
  }, [])

  return (
    <AssistantChatProvider value={chat}>
      <SidebarProvider className="min-h-0 flex-1">
        <Sidebar
          collapsible="none"
          className="hidden border-r border-border/70 md:sticky md:top-0 md:flex md:h-[calc(100svh-64px)]"
        >
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={!activeChatId}
                      onClick={startNewChat}
                      disabled={pending}
                    >
                      <SquarePen />
                      New chat
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>Your chats</SidebarGroupLabel>
              <SidebarGroupContent>
                <RecentChatsList />
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 md:pr-2">
          <div
            className={cn(
              "mx-auto grid h-full w-full content-center rounded-lg border",
              hasInteracted ? "content-between pt-10" : "content-center"
            )}
          >
            <div>
              <div
                className={cn("text-center", hasInteracted ? "hidden" : "pt-0")}
              >
                <h1 className="text-[32px] font-semibold tracking-tight text-balance">
                  Describe your ideal shadcn preset
                </h1>
              </div>

            {hasInteracted ? (
              <div className="mx-auto grid w-full max-w-4xl transition-all duration-300">
                <Conversation>
                  <ConversationContent>
                    {messages.map((m, i) => {
                      if (m.role === "user") {
                        return (
                          <Message from="user" key={`${i}-${m.role}`}>
                            <MessageContent>
                              <MessageResponse>{m.content}</MessageResponse>
                            </MessageContent>
                          </Message>
                        )
                      }

                      switch (m.kind) {
                        case "presets":
                          return (
                            <Message
                              from="assistant"
                              key={`${i}-${m.role}`}
                              className="@container"
                            >
                              <MessageContent className="overflow-visible">
                                <MessageResponse>{m.content}</MessageResponse>
                                {m.presets.length ? (
                                  <ul className="mt-4 grid gap-4 @min-lg:grid-cols-2">
                                    {m.presets.map((p, presetIndex) => (
                                      <li key={`${i}-${presetIndex}-${p.code}`}>
                                        <PresetStyleOverviewCard
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
                          )
                        case "text":
                        default:
                          return (
                            <Message from="assistant" key={`${i}-${m.role}`}>
                              <MessageContent>
                                <MessageResponse>{m.content}</MessageResponse>
                              </MessageContent>
                            </Message>
                          )
                      }
                    })}

                    {pending ? (
                      <Message from="assistant">
                        <MessageContent className="w-full rounded-lg">
                          <Shimmer className="text-sm">
                            Generating presets...
                          </Shimmer>
                          <div className="mt-3 grid gap-3 sm:grid-cols-3">
                            <div className="h-36 animate-pulse rounded-lg border border-border/60 bg-muted/30" />
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
              <div className="mx-auto w-full max-w-4xl space-y-2 p-4">
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

            <AssistantPromptComposer
              hasInteracted={hasInteracted}
              pending={pending}
              resetKey={composerResetKey}
              onPromptSubmit={onPromptSubmit}
            />
          </div>
        </div>
      </SidebarProvider>
    </AssistantChatProvider>
  )
}
