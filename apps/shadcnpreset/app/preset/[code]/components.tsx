"use client"

import * as React from "react"
import { Check, Share2 } from "lucide-react"

import { PresetVoteButton } from "@/components/preset-vote-button"
import { copyToClipboardWithMeta } from "@/components/copy-button"
import { Button } from "@/components/ui/button"

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
