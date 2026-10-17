"use client"

import * as React from "react"
import { CheckIcon, CopyIcon, TerminalIcon } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"

function CopyAction({
  label,
  value,
  icon,
  variant,
}: {
  label: string
  value: string
  icon: React.ReactNode
  variant: "default" | "outline"
}) {
  const { isCopied, copyToClipboard } = useCopyToClipboard()

  return (
    <Button
      type="button"
      size="lg"
      variant={variant}
      onClick={() => copyToClipboard(value)}
    >
      {isCopied ? <CheckIcon aria-hidden /> : icon}
      {isCopied ? "Copied" : label}
    </Button>
  )
}

export function ThemeCopyActions({
  css,
  command,
}: {
  css: string
  command: string
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <CopyAction
        label="Copy CSS"
        value={css}
        icon={<CopyIcon aria-hidden />}
        variant="default"
      />
      <CopyAction
        label="Copy command"
        value={command}
        icon={<TerminalIcon aria-hidden />}
        variant="outline"
      />
    </div>
  )
}
