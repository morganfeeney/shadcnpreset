"use client"

import Link from "next/link"
import * as React from "react"

import { copyToClipboardWithMeta } from "@/components/copy-button"
import { Button, buttonVariants } from "@/components/ui/button"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import { InfoIcon, CopyIcon, CheckIcon, ShareIcon } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

export function PresetCodeTitle({
  presetCode,
  description,
}: {
  presetCode: string
  description?: string
}) {
  const { isCopied: hasCopied, copyToClipboard } = useCopyToClipboard()

  return (
    <div>
      <h1 className="flex items-center gap-1.5 font-mono text-lg text-foreground md:text-2xl">
        <span className="min-w-0 truncate">{presetCode}</span>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="shrink-0 text-muted-foreground hover:text-foreground"
          onClick={() => copyToClipboard(presetCode)}
          aria-label={hasCopied ? "Copied" : "Copy preset code"}
        >
          {hasCopied ? (
            <CheckIcon aria-hidden className="size-4" />
          ) : (
            <CopyIcon aria-hidden className="size-4" />
          )}
        </Button>
      </h1>
      {description ? (
        <p className="text-xs text-muted-foreground">{description}</p>
      ) : null}
    </div>
  )
}

export function PresetButtons({ preset }: { preset: string }) {
  const [hasCopied, setHasCopied] = React.useState(false)

  React.useEffect(() => {
    if (hasCopied) {
      const timer = setTimeout(() => setHasCopied(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [hasCopied])

  const handleShare = React.useCallback(() => {
    const url = window.location.href
    copyToClipboardWithMeta(url, {
      name: "copy_preset_share_url",
      properties: { url, preset },
    })
    setHasCopied(true)
  }, [preset])

  return (
    <>
      <Link
        href={`/pdp/${preset}`}
        className={cn(buttonVariants({ variant: "outline" }))}
      >
        Details <InfoIcon />
      </Link>
      <Button variant="outline" onClick={handleShare}>
        {hasCopied ? "Copied" : "Share"}
        {hasCopied ? (
          <CheckIcon aria-hidden className="size-4" />
        ) : (
          <ShareIcon aria-hidden className="size-4" />
        )}
      </Button>
    </>
  )
}
