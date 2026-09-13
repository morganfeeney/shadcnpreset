"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/cn-ui/button"
import { IconPlaceholder } from "@/components/icon-placeholder"

function CodeSnippet2({
  variant = "block",
  className,
  ...props
}: React.ComponentProps<"div"> & {
  variant?: "inline" | "block"
}) {
  if (variant === "inline") {
    return (
      <code
        data-slot="code-snippet"
        data-variant="inline"
        className={cn(
          "inline-block rounded-lg bg-muted px-1.5 py-1 font-mono text-sm text-foreground",
          className
        )}
        {...props}
      />
    )
  }

  return (
    <div
      data-slot="code-snippet"
      data-variant="block"
      className={cn(
        "flex flex-col overflow-hidden rounded-lg border bg-muted",
        className
      )}
      {...props}
    />
  )
}

function CodeSnippet2Header({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="code-snippet-header"
      className={cn(
        "flex items-center justify-between gap-2 border-b p-2 pl-4",
        className
      )}
      {...props}
    />
  )
}

function CodeSnippet2Filename({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="code-snippet-filename"
      className={cn(
        "truncate font-mono text-sm text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function CodeSnippet2Body({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="code-snippet-body"
      className={cn("flex items-center gap-4 p-4 pr-2", className)}
      {...props}
    />
  )
}

function CodeSnippet2Code({
  className,
  ...props
}: React.ComponentProps<"code">) {
  return (
    <code
      data-slot="code-snippet-code"
      className={cn(
        "min-w-0 flex-1 font-mono text-sm wrap-break-word whitespace-pre-wrap text-foreground",
        className
      )}
      {...props}
    />
  )
}

function CodeSnippet2Copy({
  value,
  className,
  onClick,
  onCopied,
  onCopyError,
  "aria-label": ariaLabel = "Copy code",
  ...props
}: React.ComponentProps<typeof Button> & {
  /** What lands on the clipboard, which is rarely the same node as the label. */
  value: string
  /**
   * Fires only once the write has landed, so a caller announcing the copy in a
   * live region never announces one that failed.
   */
  onCopied?: () => void
  /**
   * The write was refused. Left to the caller because where a failure belongs
   * on screen is a decision of the surface around the button.
   */
  onCopyError?: (error: unknown) => void
}) {
  const [copied, setCopied] = React.useState(false)

  React.useEffect(() => {
    if (!copied) {
      return
    }

    const timer = window.setTimeout(() => setCopied(false), 2000)
    return () => window.clearTimeout(timer)
  }, [copied])

  async function handleClick(
    event: Parameters<
      NonNullable<React.ComponentProps<typeof Button>["onClick"]>
    >[0]
  ) {
    onClick?.(event)

    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      onCopied?.()
    } catch (error) {
      // Rejects on a denied permission or outside a secure context.
      onCopyError?.(error)
    }
  }

  return (
    <Button
      data-slot="code-snippet-copy"
      variant="ghost"
      size="icon-xs"
      type="button"
      // The icon is the whole button, so the state only reaches a screen reader
      // through the label.
      aria-label={copied ? "Copied" : ariaLabel}
      className={cn("shrink-0", className)}
      onClick={handleClick}
      {...props}
    >
      {copied ? (
        <IconPlaceholder
          lucide="Check"
          tabler="IconCheck"
          hugeicons="Tick02Icon"
          phosphor="CheckIcon"
          remixicon="RiCheckLine"
        />
      ) : (
        <IconPlaceholder
          lucide="Copy"
          tabler="IconCopy"
          hugeicons="Copy01Icon"
          phosphor="CopyIcon"
          remixicon="RiFileCopyLine"
        />
      )}
    </Button>
  )
}

export {
  CodeSnippet2,
  CodeSnippet2Body,
  CodeSnippet2Code,
  CodeSnippet2Copy,
  CodeSnippet2Filename,
  CodeSnippet2Header,
}
