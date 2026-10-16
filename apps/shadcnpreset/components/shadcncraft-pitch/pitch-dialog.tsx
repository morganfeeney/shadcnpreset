"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  SHADCNCRAFT_PITCH_HEADING,
  ShadcncraftPitch,
} from "@/components/shadcncraft-pitch/pitch"

/**
 * The shadcncraft pitch over a preset page. Its content mounts on open, so
 * each opening counts as one impression.
 */
export function ShadcncraftPitchDialog({
  presetCode,
  open,
  onOpenChange,
}: {
  presetCode: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(900px,90dvh)] overflow-y-auto p-6 sm:max-w-3xl sm:p-10">
        {/* The pitch shows its own heading; this one names the dialog. */}
        <DialogHeader className="sr-only">
          <DialogTitle>{SHADCNCRAFT_PITCH_HEADING}</DialogTitle>
          <DialogDescription>
            shadcn/ui blocks, components and a Figma kit from shadcncraft.
          </DialogDescription>
        </DialogHeader>
        <ShadcncraftPitch presetCode={presetCode} placement="pitch-dialog" />
      </DialogContent>
    </Dialog>
  )
}
