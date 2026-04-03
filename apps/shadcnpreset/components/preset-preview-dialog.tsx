"use client"

import Link from "next/link"
import { ArrowUpRight, X } from "lucide-react"
import { useState } from "react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { PresetV4Frame } from "@/components/preset-v4-frame"
import { PresetVoteButton } from "@/components/preset-vote-button"
import { Spinner } from "@/components/ui/spinner"
import {
  getPresetPreviewUrl,
  PRESET_PREVIEW_VIEWS,
  type PresetPreviewPageName,
} from "@/lib/preset"
import { ButtonGroup } from "@/components/ui/button-group"

export type PresetPreviewDialogProps = {
  code: string
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
}

/** Isolated so `key` remount resets loading state without effects. */
function DialogPreviewIframe({ src, title }: { src: string; title: string }) {
  const [loaded, setLoaded] = useState(false)
  return (
    <>
      <PresetV4Frame
        title={title}
        src={src}
        className="h-full w-full border-0"
        sandbox="allow-scripts allow-same-origin"
        onLoad={() => setLoaded(true)}
      />
      {!loaded ? (
        <div className="absolute inset-0 flex items-center justify-center bg-background">
          <Spinner />
        </div>
      ) : null}
    </>
  )
}

export function PresetPreviewDialog({
  code,
  open,
  onOpenChange,
  title,
  description,
}: PresetPreviewDialogProps) {
  const [loadGen, setLoadGen] = useState(0)
  const [previewPage, setPreviewPage] =
    useState<PresetPreviewPageName>("preview")

  const basePreviewUrl = getPresetPreviewUrl(code)
  if (!basePreviewUrl) return null

  const previewSrc = getPresetPreviewUrl(code, previewPage)!

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) {
          setLoadGen((g) => g + 1)
          setPreviewPage("preview")
        }
        onOpenChange(next)
      }}
    >
      <DialogContent
        className="grid h-[90dvh] w-full max-w-[90dvw]! grid-rows-[auto_1fr_auto] gap-0 overflow-hidden"
        showCloseButton={false}
      >
        <DialogHeader className="gap-0 pb-4">
          <div className="flex justify-between">
            <div>
              <DialogTitle className="font-mono text-sm tracking-tight md:text-xl">
                {title}
              </DialogTitle>
              {description ? (
                <DialogDescription className="line-clamp-2 text-xs">
                  {description}
                </DialogDescription>
              ) : null}
            </div>
            <div className="flex gap-2">
              <ButtonGroup>
                <PresetVoteButton code={code} enabled={open} />
                <Link
                  href={`/preset/${code}`}
                  className={cn(
                    buttonVariants({
                      variant: "outline",
                      className: "rounded-none border-l-0",
                    }),
                    "gap-2"
                  )}
                >
                  Open
                  <ArrowUpRight className="size-4" aria-hidden />
                </Link>
                <DialogTrigger
                  render={
                    <Button variant="outline">
                      <X />
                    </Button>
                  }
                />
              </ButtonGroup>
            </div>
          </div>
        </DialogHeader>
        <div className="relative -mx-4">
          <DialogPreviewIframe
            key={`${code}-${previewPage}-${loadGen}`}
            src={previewSrc}
            title={`Preset preview ${code} ${previewPage}`}
          />
        </div>
        <DialogFooter>
          <div role="tablist" aria-label="Preview layout">
            {PRESET_PREVIEW_VIEWS.map(({ page, label }) => (
              <Button
                key={page}
                type="button"
                role="tab"
                aria-selected={previewPage === page}
                variant={previewPage === page ? "default" : "ghost"}
                size="sm"
                className="h-8 rounded-md px-3 text-xs"
                onClick={() => setPreviewPage(page)}
              >
                {label}
              </Button>
            ))}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
