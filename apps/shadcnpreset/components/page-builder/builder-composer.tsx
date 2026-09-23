"use client"

import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input"
import { Shimmer } from "@/components/ai-elements/shimmer"
import { cn } from "@/lib/utils"

/**
 * The assistant's composer, for describing a page. Built from the same
 * prompt-input parts rather than AssistantPromptComposer itself, which also
 * restores prompts queued for the assistant chat and links home.
 *
 * The text stays after sending: it describes the page, so the next draft is
 * an edit of it rather than a new message.
 */
export function BuilderComposer({
  value,
  onChange,
  onSubmit,
  pending,
  status,
  error,
  floating,
  className,
}: {
  value: string
  onChange: (value: string) => void
  onSubmit: (text: string) => void
  pending: boolean
  /** What Jev last did, shown beside the send button. */
  status?: string
  error?: string
  /** Over the page, as the assistant's composer sits over its chat. */
  floating: boolean
  className?: string
}) {
  return (
    <PromptInput
      onSubmit={({ text }) => {
        if (text.trim()) onSubmit(text.trim())
      }}
      className={cn(
        "z-20 mx-auto w-full max-w-[690px] p-4",
        floating &&
          "rounded-xl border border-border/60 bg-background/70 shadow-lg backdrop-blur supports-backdrop-filter:bg-background/55",
        className
      )}
    >
      <PromptInputBody>
        <PromptInputTextarea
          rows={2}
          maxLength={300}
          aria-label="Describe a page"
          placeholder="Describe a page, like a landing page for a cosy coffee shop…"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-h-14 resize-none"
        />
      </PromptInputBody>
      <PromptInputFooter>
        <PromptInputTools className="min-w-0">
          {pending ? (
            <Shimmer className="text-xs">Drafting…</Shimmer>
          ) : error ? (
            <p className="truncate text-xs text-destructive" role="alert">
              {error}
            </p>
          ) : status ? (
            <p className="truncate text-xs text-muted-foreground tabular-nums">
              {status}
            </p>
          ) : null}
        </PromptInputTools>
        <PromptInputSubmit
          status={pending ? "submitted" : "ready"}
          disabled={pending || !value.trim()}
        />
      </PromptInputFooter>
    </PromptInput>
  )
}
