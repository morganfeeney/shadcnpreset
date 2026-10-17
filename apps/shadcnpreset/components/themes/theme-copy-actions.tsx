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
export function ThemeCopyActions({ code, css }: { code: string; css: string }) {
  const install = useThemeInstall({ code, css })

  return (
    <div className="flex gap-2">
      <CopyAction
        label="Copy CSS"
        value={install.css}
        icon={<CopyIcon aria-hidden />}
        variant="default"
      />
      <CopyAction
        label={
          install.fonts ? "Copy command (installs the fonts)" : "Copy command"
        }
        value={install.command}
        icon={<TerminalIcon aria-hidden />}
        variant="outline"
      />
    </div>
  )
}
