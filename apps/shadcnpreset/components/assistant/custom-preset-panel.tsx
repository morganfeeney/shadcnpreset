"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { ChevronLeftIcon, ExternalLinkIcon, XIcon } from "lucide-react"

import { CustomPresetEditor } from "@/components/custom-presets/custom-preset-editor"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import type { CustomColours } from "@/lib/custom-colours"
import { customPresetPath } from "@/lib/custom-preset"

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
 * under a header that closes it (on a phone, goes back to the chat) or opens
 * the full page to share.
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

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex h-13 shrink-0 items-center gap-2 border-b px-2 xl:px-4">
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
        <h2 className="truncate font-semibold">Your custom preset</h2>
        {preset.data ? (
          <code className="hidden font-mono text-xs text-muted-foreground sm:inline">
            {preset.data.presetCode}
          </code>
        ) : null}
        <span className="flex-1" />
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link href={customPresetPath(id)} />}
        >
          <ExternalLinkIcon data-icon="inline-start" />
          <span className="hidden sm:inline">Open full page</span>
          <span className="sr-only sm:hidden">Open full page</span>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Close"
          className="hidden xl:inline-flex"
          onClick={onClose}
        >
          <XIcon />
        </Button>
      </header>
      <div className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 xl:p-6">
        {preset.data ? (
          <CustomPresetEditor
            // An edit from the chat replaces what is open: start again from it.
            key={`${id}:${preset.data.presetCode}:${JSON.stringify(preset.data.colours)}`}
            embedded
            id={id}
            initialCode={preset.data.presetCode}
            colours={preset.data.colours}
            canEdit={preset.data.canEdit}
            origin={window.location.origin}
          />
        ) : preset.isError ? (
          <p className="text-sm text-muted-foreground">
            This custom preset couldn’t be found.
          </p>
        ) : (
          <div
            role="status"
            aria-label="Loading custom preset"
            className="grid gap-6"
          >
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {Array.from({ length: 8 }, (_, i) => (
                <Skeleton key={i} className="h-14" />
              ))}
            </div>
            <Skeleton className="h-96 rounded-2xl" />
          </div>
        )}
      </div>
    </div>
  )
}
