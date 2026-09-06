"use client"

import Link from "next/link"
import * as React from "react"

import { copyToClipboardWithMeta } from "@/components/copy-button"
import { GetCodeDialog } from "@/components/get-code-dialog"
import { PresetVoteButton } from "@/components/preset-vote-button"
import { Button, buttonVariants } from "@/components/ui/button"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import {
  CheckIcon,
  CodeIcon,
  CopyIcon,
  InfoIcon,
  ShareIcon,
} from "@phosphor-icons/react"
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
    <div className="min-w-0">
      <h1 className="flex items-center gap-1.5 font-mono text-2xl tracking-tight text-foreground">
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
        <p className="text-sm text-muted-foreground">{description}</p>
      ) : null}
    </div>
  )
}

export function PresetButtons({ preset }: { preset: string }) {
  const [hasCopied, setHasCopied] = React.useState(false)
  const [getCodeOpen, setGetCodeOpen] = React.useState(false)

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
      <PresetVoteButton size="lg" code={preset} />
      <Button size="lg" variant="outline" onClick={() => setGetCodeOpen(true)}>
        <CodeIcon className="size-4" />
        Code
      </Button>
      <Button variant="outline" size="lg" onClick={handleShare}>
        {hasCopied ? "Copied" : "Share"}
        {hasCopied ? (
          <CheckIcon aria-hidden className="size-4" />
        ) : (
          <ShareIcon aria-hidden className="size-4" />
        )}
      </Button>
      <Link
        href={`/pdp/${preset}`}
        className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
      >
        Details <InfoIcon />
      </Link>
      <GetCodeDialog
        open={getCodeOpen}
        onOpenChange={setGetCodeOpen}
        presetCode={preset}
      />
    </>
  )
}
