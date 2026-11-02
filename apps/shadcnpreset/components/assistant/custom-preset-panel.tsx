"use client"

import { useQuery } from "@tanstack/react-query"
import { ChevronLeftIcon, XIcon } from "lucide-react"

import { CustomPresetEditor } from "@/components/custom-presets/custom-preset-editor"
import { CustomPresetBodySkeleton } from "@/components/custom-presets/custom-preset-skeleton"
import { Button } from "@/components/ui/button"
import type { CustomColours } from "@/lib/custom-colours"

type CustomPresetResponse = {
  id: string
  presetCode: string
  colours: CustomColours
  canEdit: boolean
}

async function fetchCustomPreset(id: string): Promise<CustomPresetResponse> {
  const response = await fetch(`/api/custom-presets/${id}`)
  if (!response.ok) throw new Error("not found")
  return (await response.json()) as CustomPresetResponse
}

/**
 * A custom preset beside the conversation: the same editor as its own page,
 * with a way back to the chat on a phone and a close button on a wide screen.
 */
export function CustomPresetPanel({
  id,
  onClose,
}: {
  id: string
  onClose: () => void
}) {
  const preset = useQuery({
    queryKey: ["customPreset", id],
    queryFn: () => fetchCustomPreset(id),
    retry: false,
    // The editor owns it once open; refetching would reset what is on screen.
    staleTime: Infinity,
  })

  const start = (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="xl:hidden"
      onClick={onClose}
    >
      <ChevronLeftIcon data-icon="inline-start" />
      Chat
    </Button>
  )
  const end = (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label="Close"
      className="hidden xl:inline-flex"
      onClick={onClose}
    >
      <XIcon />
    </Button>
  )

  if (preset.data) {
    return (
      <CustomPresetEditor
        // Another preset is another editor. An edit from the chat arrives as
        // new props instead, so the preview keeps its frame and repaints.
        key={id}
        id={id}
        initialCode={preset.data.presetCode}
        colours={preset.data.colours}
        canEdit={preset.data.canEdit}
        origin={window.location.origin}
        start={start}
        end={end}
      />
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex h-12 shrink-0 items-center gap-2 border-b px-2 lg:px-3">
        {start}
        <h2 className="truncate text-sm font-semibold">Your custom preset</h2>
        <span className="flex-1" />
        {end}
      </header>
      {preset.isError ? (
        <p className="p-4 text-sm text-muted-foreground">
          This custom preset couldn’t be found.
        </p>
      ) : (
        <CustomPresetBodySkeleton />
      )}
    </div>
  )
}
