"use client"

import Link from "next/link"
import * as React from "react"

import {
  PresetCodeButton,
  PresetShareButton,
} from "@/components/preset-action-buttons"
import { PresetVoteButton } from "@/components/preset-vote-button"
import { ShadcncraftPitchDialog } from "@/components/shadcncraft-pitch/pitch-dialog"
import { ShadcncraftLogo } from "@/components/shadcncraft-pitch/shadcncraft-logo"
import { Button, buttonVariants } from "@/components/ui/button"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import { CheckIcon, CopyIcon, InfoIcon } from "@phosphor-icons/react"
import { formatPresetCardDescription } from "@/lib/preset-card-description"
import { resolvePresetFromCode } from "@/lib/preset"
import { usePresetPageLiveOptional } from "@/components/preset-page-live-context"
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
        <PresetButtons preset={resolved?.code ?? code} sharePath={sharePath} />
      </div>
    </div>
  )
}

export function PresetButtons({
  preset,
  sharePath,
  size = "lg",
  customColours,
  children,
}: {
  preset: string
  sharePath?: string
  size?: "sm" | "lg"
  /** Custom colours, for the Code dialog to install. */
  customColours?: { css: string; registryUrl?: string }
  /** More actions, after the rest. */
  children?: React.ReactNode
}) {
  const [pitchOpen, setPitchOpen] = React.useState(false)

  return (
    <>
      <PresetVoteButton size={size} code={preset} />
      <Button size={size} variant="outline" onClick={() => setPitchOpen(true)}>
        <ShadcncraftLogo data-icon="inline-start" className="size-4" />
        Get the blocks
      </Button>
      <PresetCodeButton
        size={size}
        presetCode={preset}
        customColours={customColours}
      />
      <PresetShareButton
        size={size}
        getUrl={() =>
          sharePath
            ? new URL(sharePath, window.location.origin).href
            : window.location.href
        }
      />
      <Link
        href={`/pdp/${preset}`}
        className={cn(buttonVariants({ variant: "outline", size }))}
      >
        <InfoIcon data-icon="inline-start" className="size-4" />
        Details
      </Link>
      <ShadcncraftPitchDialog
        open={pitchOpen}
        onOpenChange={setPitchOpen}
        presetCode={preset}
      />
      {children}
    </>
  )
}
