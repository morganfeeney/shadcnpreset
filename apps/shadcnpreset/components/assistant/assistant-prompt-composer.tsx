"use client"

import Link from "next/link"
import * as React from "react"
import { HomeIcon, PlusIcon } from "lucide-react"

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
import { Button, buttonVariants } from "@/components/ui/button"
import {
  clearPendingAssistantPrompt,
  readPendingAssistantPrompt,
} from "@/lib/pending-assistant-prompt"
import { cn } from "@/lib/utils"

type AssistantPromptComposerProps = {
  hasInteracted: boolean
  pending: boolean
  /**
   * Closes the composer without claiming a reply is on its way — for waiting
   * on something other than the model, such as a chat still loading.
   */
  disabled?: boolean
  resetKey: number
  onPromptSubmit: (text: string) => Promise<void>
  /**
   * Adds a New chat control to the tools row. For surfaces that have no route
   * of their own to carry the action, such as the preset page sidebar.
   */
  onNewChat?: () => void
  variant?: "default" | "compact"
  placeholder?: string
  className?: string
}

export function AssistantPromptComposer({
  hasInteracted,
  pending,
  disabled = false,
  resetKey,
  onPromptSubmit,
  onNewChat,
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
              // The pane below the conversation's scroller, not a sticky
              // overlay on it — it holds its place while the chat moves past.
              hasInteracted
                ? "mt-6 max-w-4xl shrink-0 rounded-xl border border-border/60 bg-background/70 backdrop-blur supports-backdrop-filter:bg-background/55"
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
          disabled={pending || disabled}
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
          {onNewChat ? (
            <Button
              type="button"
              variant="outline"
              size={compact ? "xs" : "sm"}
              onClick={onNewChat}
              disabled={pending || disabled}
            >
              <PlusIcon />
              New chat
            </Button>
          ) : null}
          {pending ? (
            <Shimmer className="text-xs">Thinking...</Shimmer>
          ) : null}
        </PromptInputTools>
        <PromptInputSubmit
          status={pending ? "submitted" : "ready"}
          disabled={pending || disabled || !input.trim()}
        />
      </PromptInputFooter>
    </PromptInput>
  )
}
