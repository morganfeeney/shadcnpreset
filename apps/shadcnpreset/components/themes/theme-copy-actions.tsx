"use client"

import * as React from "react"
import { CheckIcon, CopyIcon, TerminalIcon } from "@phosphor-icons/react"

import { useThemeInstall } from "@/components/themes/theme-fonts"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import { trackEvent } from "@/lib/analytics-events"

function CopyAction({
  label,
  value,
  icon,
  variant,
  onCopy,
}: {
  label: string
  value: string
  icon: React.ReactNode
  variant: "default" | "outline"
  onCopy: () => void
}) {
  // Reported only once the copy succeeds.
  const { isCopied, copyToClipboard } = useCopyToClipboard({ onCopy })

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            type="button"
            size="icon-lg"
            variant={variant}
            aria-label={label}
            onClick={() => copyToClipboard(value)}
          />
        }
      >
        {isCopied ? <CheckIcon aria-hidden /> : icon}
      </TooltipTrigger>
      <TooltipContent>{isCopied ? "Copied" : label}</TooltipContent>
    </Tooltip>
  )
}

/** Copies the theme's CSS and command, with the picked fonts when there are any. */
export function ThemeCopyActions({
  themeSlug,
  code,
  css,
}: {
  themeSlug: string
  code: string
  css: string
}) {
  const install = useThemeInstall({ code, css })
  const track = (kind: "css" | "command") =>
    trackEvent("theme_copy", {
      theme_slug: themeSlug,
      kind,
      with_fonts: install.fonts ? "yes" : "no",
    })

  return (
    <div className="flex gap-2">
      <CopyAction
        label="Copy CSS"
        value={install.css}
        icon={<CopyIcon aria-hidden />}
        variant="default"
        onCopy={() => track("css")}
      />
      <CopyAction
        label={
          install.fonts ? "Copy command (installs the fonts)" : "Copy command"
        }
        value={install.command}
        icon={<TerminalIcon aria-hidden />}
        variant="outline"
        onCopy={() => track("command")}
      />
    </div>
  )
}
