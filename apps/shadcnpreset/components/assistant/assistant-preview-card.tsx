"use client"

import * as React from "react"
import { MaximizeIcon } from "lucide-react"

import { PresetV4Frame } from "@/components/preset-v4-frame"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import type { AssistantPreviewMessage } from "@/components/assistant/use-assistant-chat"
import { getPresetPreviewUrl } from "@/lib/preset"
import { cn } from "@/lib/utils"

type AssistantPreviewCardProps = {
  preview: AssistantPreviewMessage["preview"]
  /** Preset to render onto when the preview itself does not carry one. */
  fallbackPresetCode?: string
  /** Shown when the surface can move this preview into the main preview area. */
  onOpenInMainPreview?: () => void
  className?: string
}

/**
 * Renders a generated preview inline in the conversation. The code is handed to
 * the sandboxed preview route over `postMessage`; it is never evaluated here.
 */
export function AssistantPreviewCard({
  preview,
  fallbackPresetCode,
  onOpenInMainPreview,
  className,
}: AssistantPreviewCardProps) {
  const presetCode = preview.presetCode ?? fallbackPresetCode
  const previewSrc = presetCode
    ? getPresetPreviewUrl(presetCode, "generated")
    : null
  const [loaded, setLoaded] = React.useState(false)

  const payload = React.useMemo(
    () => ({ title: preview.title, code: preview.code }),
    [preview.title, preview.code]
  )

  // Older chats were persisted before previews carried their preset, and the
  // standalone assistant has no live preset — show the message text only.
  if (!previewSrc) {
    return null
  }

  return (
    <figure className={cn("mt-3 overflow-hidden rounded-lg border", className)}>
      <figcaption className="flex items-center justify-between gap-2 border-b bg-muted/40 px-3 py-1.5">
        <span className="truncate text-xs font-medium">{preview.title}</span>
        {onOpenInMainPreview ? (
          <Button
            type="button"
            variant="ghost"
            size="xs"
            className="shrink-0 text-xs"
            onClick={onOpenInMainPreview}
          >
            <MaximizeIcon />
            Open
          </Button>
        ) : null}
      </figcaption>
      <div className="relative aspect-[4/3] w-full bg-background">
        {loaded ? null : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Spinner />
          </div>
        )}
        <PresetV4Frame
          className={cn(
            "h-full w-full border-0 transition-opacity duration-200",
            loaded ? "opacity-100" : "opacity-0"
          )}
          src={previewSrc}
          title={`${preview.title} preview`}
          sandbox="allow-scripts allow-same-origin"
          loading="lazy"
          generatedPreview={payload}
          onLoad={() => setLoaded(true)}
        />
      </div>
    </figure>
  )
}
