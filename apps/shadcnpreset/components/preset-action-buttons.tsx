"use client"

import * as React from "react"
import { CheckIcon, CodeIcon, ShareIcon } from "@phosphor-icons/react"

import { GetCodeDialog } from "@/components/get-code-dialog"
import { Button } from "@/components/ui/button"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"

type Size = "sm" | "lg"

/**
 * The actions a preset has wherever it is shown (its page, Ask AI's panel),
 * drawn the same: outline, a Phosphor icon before the label.
 */

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

export { PresetCodeButton, PresetShareButton }
