"use client"

import * as React from "react"

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
import type {
  AssistantPreviewMessage,
  ChatMessage,
} from "@/components/assistant/use-assistant-chat"

type PresetMessage = Extract<ChatMessage, { role: "assistant"; kind: "presets" }>

type AssistantConversationProps = {
  messages: ChatMessage[]
  pending: boolean
  renderPresets: (message: PresetMessage, index: number) => React.ReactNode
  /** Omit on surfaces that cannot render a generated preview; the text still shows. */
  renderPreview?: (
    message: AssistantPreviewMessage,
    index: number
  ) => React.ReactNode
  conversationContentClassName?: string
  pendingContent?: React.ReactNode
  className?: string
  /**
   * Scrolls the page down to the newest turn as it arrives. For the full-page
   * assistant, where the conversation grows the document and a reply otherwise
   * lands below the fold. The sidebar leaves it off: that pane scrolls on its
   * own, and dragging the preset page around underneath it is jarring.
   */
  scrollLatestIntoView?: boolean
}

export function AssistantConversation({
  messages,
  pending,
  renderPresets,
  renderPreview,
  conversationContentClassName,
  pendingContent,
  className,
  scrollLatestIntoView = false,
}: AssistantConversationProps) {
  const bottomRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!scrollLatestIntoView) return
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [scrollLatestIntoView, messages, pending])

  return (
    <Conversation className={className}>
      <ConversationContent className={conversationContentClassName}>
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
            case "preview":
              return (
                <Message
                  from="assistant"
                  key={`${i}-${m.role}`}
                  className="@container"
                >
                  <MessageContent className="overflow-visible">
                    <MessageResponse>{m.content}</MessageResponse>
                    {renderPreview?.(m, i)}
                  </MessageContent>
                </Message>
              )
            case "presets":
              return (
                <Message
                  from="assistant"
                  key={`${i}-${m.role}`}
                  className="@container"
                >
                  <MessageContent className="overflow-visible">
                    <MessageResponse>{m.content}</MessageResponse>
                    {m.presets.length ? renderPresets(m, i) : null}
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
          pendingContent ?? (
            <Message from="assistant">
              <MessageContent className="w-full rounded-lg">
                <Shimmer className="text-sm">Generating presets...</Shimmer>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <div className="h-36 animate-pulse rounded-lg border border-border/60 bg-muted/30" />
                  <div className="h-36 animate-pulse rounded-lg border border-border/60 bg-muted/30" />
                  <div className="h-36 animate-pulse rounded-lg border border-border/60 bg-muted/30" />
                </div>
              </MessageContent>
            </Message>
          )
        ) : null}

        {scrollLatestIntoView ? <div ref={bottomRef} /> : null}
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  )
}

export function AssistantPendingCompact({
  label = "Generating presets...",
}: {
  label?: string
}) {
  return (
    <Message from="assistant">
      <MessageContent className="w-full rounded-lg">
        <Shimmer className="text-sm">{label}</Shimmer>
        <div className="mt-3 flex flex-col gap-3">
          <div className="aspect-[2/1] animate-pulse rounded-lg border border-border/60 bg-muted/30" />
          <div className="aspect-[2/1] animate-pulse rounded-lg border border-border/60 bg-muted/30" />
        </div>
      </MessageContent>
    </Message>
  )
}
