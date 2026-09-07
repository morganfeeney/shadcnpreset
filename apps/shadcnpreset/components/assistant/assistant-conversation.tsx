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
import type { ChatMessage } from "@/components/assistant/use-assistant-chat"

type PresetMessage = Extract<ChatMessage, { role: "assistant"; kind: "presets" }>

type AssistantConversationProps = {
  messages: ChatMessage[]
  pending: boolean
  renderPresets: (message: PresetMessage, index: number) => React.ReactNode
  conversationContentClassName?: string
  pendingContent?: React.ReactNode
  className?: string
}

export function AssistantConversation({
  messages,
  pending,
  renderPresets,
  conversationContentClassName,
  pendingContent,
  className,
}: AssistantConversationProps) {
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
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  )
}

export function AssistantPendingCompact() {
  return (
    <Message from="assistant">
      <MessageContent className="w-full rounded-lg">
        <Shimmer className="text-sm">Generating presets...</Shimmer>
        <div className="mt-3 flex flex-col gap-3">
          <div className="aspect-[2/1] animate-pulse rounded-lg border border-border/60 bg-muted/30" />
          <div className="aspect-[2/1] animate-pulse rounded-lg border border-border/60 bg-muted/30" />
        </div>
      </MessageContent>
    </Message>
  )
}
