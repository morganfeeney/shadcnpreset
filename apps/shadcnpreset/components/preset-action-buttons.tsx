"use client"

import * as React from "react"
import Link from "next/link"
import {
  CheckIcon,
  CodeIcon,
  InfoIcon,
  ShareIcon,
} from "@phosphor-icons/react"

import { GetCodeDialog } from "@/components/get-code-dialog"
import { ShadcncraftPitchDialog } from "@/components/shadcncraft-pitch/pitch-dialog"
import { ShadcncraftLogo } from "@/components/shadcncraft-pitch/shadcncraft-logo"
import { PresetVoteButton } from "@/components/preset-vote-button"
import { Button, buttonVariants } from "@/components/ui/button"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import { cn } from "@/lib/utils"

type Size = "sm" | "lg"

/**
 * The actions a preset has wherever it is shown (its page, Ask AI's panel),
 * drawn the same: outline, a Phosphor icon before the label.
 */

/** Opens the pitch for the shadcncraft blocks the preset is shown with. */
function PresetBlocksButton({
  presetCode,
  size = "sm",
}: {
  presetCode: string
  size?: Size
}) {
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <Button
        type="button"
        size={size}
        variant="outline"
        onClick={() => setOpen(true)}
      >
        <ShadcncraftLogo data-icon="inline-start" className="size-4" />
        Get the blocks
      </Button>
      <ShadcncraftPitchDialog
        open={open}
        onOpenChange={setOpen}
        presetCode={presetCode}
      />
    </>
  )
}

/** Opens the Code dialog: the preset's commands, then any custom colours. */
function PresetCodeButton({
  presetCode,
  customColours,
  size = "sm",
}: {
  presetCode: string
  customColours?: { css: string; registryUrl?: string }
  size?: Size
}) {
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <Button
        type="button"
        size={size}
        variant="outline"
        onClick={() => setOpen(true)}
      >
        <CodeIcon data-icon="inline-start" className="size-4" />
        Code
      </Button>
      <GetCodeDialog
        open={open}
        onOpenChange={setOpen}
        presetCode={presetCode}
        customColours={customColours}
      />
    </>
  )
}

/** Copies a link to the preset, read when clicked. */
function PresetShareButton({
  getUrl,
  onShare,
  size = "sm",
}: {
  getUrl: () => string
  /** After copying, to count it. */
  onShare?: (url: string) => void
  size?: Size
}) {
  const { isCopied, copyToClipboard } = useCopyToClipboard()
  return (
    <Button
      type="button"
      size={size}
      variant="outline"
      onClick={() => {
        const url = getUrl()
        void copyToClipboard(url)
        onShare?.(url)
      }}
    >
      {isCopied ? (
        <CheckIcon data-icon="inline-start" className="size-4" />
      ) : (
        <ShareIcon data-icon="inline-start" className="size-4" />
      )}
      {isCopied ? "Copied" : "Share"}
    </Button>
  )
}

/**
 * Everything to do with a preset, in order: like it, get the blocks, its
 * code, share it, its details, then anything the page adds.
 */
function PresetActionButtons({
  preset,
  sharePath,
  size = "lg",
  customColours,
  children,
}: {
  preset: string
  /** What Share copies, when the page's address isn't the preset's own. */
  sharePath?: string
  size?: Size
  /** Custom colours, for the Code dialog to install. */
  customColours?: { css: string; registryUrl?: string }
  /** More actions, after the rest. */
  children?: React.ReactNode
}) {
  return (
    <>
      <PresetVoteButton size={size} code={preset} />
      <PresetBlocksButton size={size} presetCode={preset} />
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
      {children}
    </>
  )
}

export {
  PresetActionButtons,
  PresetBlocksButton,
  PresetCodeButton,
  PresetShareButton,
}
