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
import { cn } from "@/lib/utils"
import type {
  AssistantPreviewMessage,
  ChatMessage,
} from "@/components/assistant/use-assistant-chat"

type PresetMessage = Extract<
  ChatMessage,
  { role: "assistant"; kind: "presets" }
>

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
  /**
   * What the turn in flight will produce, which decides the shape of the
   * placeholder. Omitted, it falls back to presets.
   */
  pendingKind?: "preview" | "presets" | null
  /** `compact` is the sidebar: narrower, and no preview lands in it. */
  pendingVariant?: "default" | "compact"
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
  pendingKind = "presets",
  pendingVariant = "default",
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
          <AssistantPending
            kind={pendingKind ?? "presets"}
            variant={pendingVariant}
          />
        ) : null}

        {scrollLatestIntoView ? <div ref={bottomRef} /> : null}
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  )
}

const shimmer = "animate-pulse rounded-lg border border-border/60 bg-muted/30"

/**
 * The waiting state, shaped like what is coming.
 *
 * Every request used to wait behind "Generating presets..." and a row of card
 * skeletons, including the ones that were about to return a component. The
 * placeholder said the wrong thing and then the wrong thing appeared in its
 * place.
 */
function AssistantPending({
  kind,
  variant,
}: {
  kind: "preview" | "presets"
  variant: "default" | "compact"
}) {
  return (
    <Message from="assistant" className="@container">
      <MessageContent className="w-full rounded-lg">
        <Shimmer className="text-sm">
          {kind === "preview"
            ? "Generating preview..."
            : "Generating presets..."}
        </Shimmer>
        <PendingPlaceholder kind={kind} variant={variant} />
      </MessageContent>
    </Message>
  )
}

/** The blocks under the label, sized like whatever is about to replace them. */
function PendingPlaceholder({
  kind,
  variant,
}: {
  kind: "preview" | "presets"
  variant: "default" | "compact"
}) {
  if (variant === "compact") {
    // The sidebar does not render previews — they go to the main pane, and
    // only the sentence lands here. There is nothing to hold a place for, so
    // the label is the whole state.
    if (kind === "preview") return null

    return (
      <div className="mt-3 flex flex-col gap-2">
        <div className={cn(shimmer, "h-14")} />
        <div className={cn(shimmer, "h-14")} />
        <div className={cn(shimmer, "h-14")} />
      </div>
    )
  }

  // Shaped like the preview card: a caption bar over a 4:3 frame.
  if (kind === "preview") {
    return (
      <figure className="mt-3 overflow-hidden rounded-lg border">
        <figcaption className="flex h-7 items-center border-b bg-muted/40 px-3">
          <div className={cn(shimmer, "h-3 w-24 border-0")} />
        </figcaption>
        <div className="aspect-[4/3] w-full animate-pulse bg-muted/30" />
      </figure>
    )
  }

  return (
    <div className="mt-3 grid gap-4 @min-lg:grid-cols-2">
      <div className={cn(shimmer, "h-36")} />
      <div className={cn(shimmer, "h-36")} />
      <div className={cn(shimmer, "h-36")} />
      <div className={cn(shimmer, "h-36")} />
    </div>
  )
}
