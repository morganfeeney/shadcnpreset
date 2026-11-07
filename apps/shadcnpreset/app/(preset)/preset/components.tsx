"use client"

import * as React from "react"

import { PresetActionButtons } from "@/components/preset-action-buttons"
import { Button } from "@/components/ui/button"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import { CheckIcon, CopyIcon } from "@phosphor-icons/react"
import { formatPresetCardDescription } from "@/lib/preset-card-description"
import { resolvePresetFromCode } from "@/lib/preset"
import { usePresetPageLiveOptional } from "@/components/preset-page-live-context"

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

export function PresetLiveHero({
  initialCode,
  initialDescription,
  sharePath,
}: {
  initialCode: string
  initialDescription: string
  /** What Share copies, when the page URL is not the preset's own. */
  sharePath?: string
}) {
  const live = usePresetPageLiveOptional()
  const code = live?.livePresetCode ?? initialCode
  const resolved = resolvePresetFromCode(code)
  const description = resolved
    ? formatPresetCardDescription(resolved)
    : initialDescription

  return (
    <div className="flex flex-wrap items-start justify-between gap-4 py-6">
      <PresetCodeTitle presetCode={code} description={description} />
      <div className="flex flex-wrap items-center justify-end gap-2">
        <PresetActionButtons
          preset={resolved?.code ?? code}
          sharePath={sharePath}
        />
      </div>
    </div>
  )
}
