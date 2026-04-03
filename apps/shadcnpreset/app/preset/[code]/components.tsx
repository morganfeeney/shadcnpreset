"use client"

import * as React from "react"
import { Check, Copy, Share2 } from "lucide-react"

import { PresetVoteButton } from "@/components/preset-vote-button"
import { copyToClipboardWithMeta } from "@/components/copy-button"
import { Button } from "@/components/ui/button"

export function PresetCodeTitle({ presetCode }: { presetCode: string }) {
  const [hasCopied, setHasCopied] = React.useState(false)

  React.useEffect(() => {
    if (hasCopied) {
      const timer = setTimeout(() => setHasCopied(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [hasCopied])

  const handleCopy = React.useCallback(() => {
    copyToClipboardWithMeta(presetCode, {
      name: "copy_preset_code",
      properties: { preset: presetCode },
    })
    setHasCopied(true)
  }, [presetCode])

  return (
    <h1 className="flex items-center gap-1.5 font-mono text-lg text-foreground md:text-2xl">
      <span className="min-w-0 truncate">{presetCode}</span>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="shrink-0 text-muted-foreground hover:text-foreground"
        onClick={handleCopy}
        aria-label={hasCopied ? "Copied" : "Copy preset code"}
      >
        {hasCopied ? (
          <Check aria-hidden className="size-4" />
        ) : (
          <Copy aria-hidden className="size-4" />
        )}
      </Button>
    </h1>
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
      <PresetVoteButton code={preset} />
      <Button variant="outline" onClick={handleShare}>
        {hasCopied ? "Copied" : "Share"}
        {hasCopied ? (
          <Check aria-hidden className="size-4" />
        ) : (
          <Share2 aria-hidden className="size-4" />
        )}
      </Button>
    </>
  )
}
