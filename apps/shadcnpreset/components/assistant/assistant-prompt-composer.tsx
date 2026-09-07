"use client"

import Link from "next/link"
import * as React from "react"
import { HomeIcon } from "lucide-react"

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
import { buttonVariants } from "@/components/ui/button"
import {
  clearPendingAssistantPrompt,
  readPendingAssistantPrompt,
} from "@/lib/pending-assistant-prompt"
import { cn } from "@/lib/utils"

type AssistantPromptComposerProps = {
  hasInteracted: boolean
  pending: boolean
  resetKey: number
  onPromptSubmit: (text: string) => Promise<void>
  variant?: "default" | "compact"
  placeholder?: string
  className?: string
}

export function AssistantPromptComposer({
  hasInteracted,
  pending,
  resetKey,
  onPromptSubmit,
  variant = "default",
  placeholder,
  className,
}: AssistantPromptComposerProps) {
  const [input, setInput] = React.useState("")
  const [syncedResetKey, setSyncedResetKey] = React.useState(resetKey)
  const [didRestorePending, setDidRestorePending] = React.useState(false)
  // false during SSR + hydration, true on the client after hydrate.
  const isClient = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  if (resetKey !== syncedResetKey) {
    setSyncedResetKey(resetKey)
    setInput("")
  } else if (isClient && !didRestorePending) {
    setDidRestorePending(true)
    const pendingPrompt = readPendingAssistantPrompt()
    if (pendingPrompt) {
      clearPendingAssistantPrompt()
      setInput(pendingPrompt)
    }
  }

  const compact = variant === "compact"
  const resolvedPlaceholder =
    placeholder ??
    (hasInteracted ? "Reply to refine..." : "Ask AI to build...")

  return (
    <PromptInput
      onSubmit={async (message: PromptInputMessage) => {
        const text = message.text
        const previous = input
        setInput("")
        try {
          await onPromptSubmit(text)
        } catch {
          setInput(previous)
        }
      }}
      className={cn(
        compact
          ? "w-full p-3"
          : cn(
              "z-20 mx-auto w-full max-w-[690px] p-4 transition-all duration-300",
              hasInteracted
                ? "sticky bottom-0 mt-6 max-w-4xl rounded-xl border border-border/60 bg-background/70 backdrop-blur supports-backdrop-filter:bg-background/55"
                : ""
            ),
        className
      )}
    >
      <PromptInputBody>
        <PromptInputTextarea
          rows={compact ? 2 : hasInteracted ? 3 : 2}
          placeholder={resolvedPlaceholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={pending}
          className={compact ? "min-h-14 resize-none" : "min-h-[88px] resize-y"}
        />
      </PromptInputBody>
      <PromptInputFooter>
        <PromptInputTools>
          {compact ? null : (
            <Link
              href="/"
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              <HomeIcon className="mr-1.5 size-4 opacity-70" />
              Home
            </Link>
          )}
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
  )
}
