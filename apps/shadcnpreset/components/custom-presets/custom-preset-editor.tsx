"use client"

import * as React from "react"
import { toast } from "sonner"

import { CustomPresetProperties } from "@/components/custom-presets/custom-preset-properties"
import {
  PresetBlocksButton,
  PresetCodeButton,
  PresetShareButton,
} from "@/components/preset-action-buttons"
import { PresetPreviewLayoutPicker } from "@/components/preset-preview/layout-picker"
import { PresetVoteButton } from "@/components/preset-vote-button"
import { PresetV4Frame } from "@/components/preset-v4-frame"
import { Spinner } from "@/components/ui/spinner"
import type { CustomColours } from "@/lib/custom-colours"
import {
  buildCustomPreset,
  customPresetRegistryPath,
  installablePresetCode,
} from "@/lib/custom-preset"
import { getPresetPreviewUrl } from "@/lib/preset"
import type { PresetPreviewPageName } from "@/lib/preset-preview"
import { trackEvent } from "@/lib/analytics-events"
import { customPresetPath, hasColours } from "@/lib/preset-draft"
import { cn } from "@/lib/utils"

/** How long a dragged picker rests before its colour is saved. */
const SAVE_DELAY_MS = 400

type Draft = { code: string; colours: CustomColours }

/**
 * A custom preset to work on: create's preview in its colours, and a column
 * of everything to change beside it. Changes save as they are made, so the
 * install link always gives what is on screen; only the person who made it
 * can change anything. `start` and `end` go either side of its bar, for the
 * panel's way back to the chat and its close button.
 */
export function CustomPresetEditor({
  id,
  initialCode,
  colours: initialColours,
  canEdit,
  origin,
  start,
  end,
}: {
  id: string
  initialCode: string
  colours: CustomColours
  canEdit: boolean
  origin: string
  start?: React.ReactNode
  end?: React.ReactNode
}) {
  const [draft, setDraft] = React.useState<Draft>({
    code: initialCode,
    colours: initialColours,
  })
  const { code, colours } = draft
  const preset = React.useMemo(
    () => buildCustomPreset(code, colours),
    [code, colours]
  )

  // An edit from elsewhere (the chat) replaces what is on screen, in place.
  const [given, setGiven] = React.useState<Draft>(draft)
  if (given.code !== initialCode || given.colours !== initialColours) {
    const next = { code: initialCode, colours: initialColours }
    setGiven(next)
    setDraft(next)
  }

  // What the server last accepted, to go back to when a save fails. An edit
  // that arrives is already saved, and wins over a drag still waiting to be.
  const saved = React.useRef(draft)
  const pendingSave = React.useRef<number | undefined>(undefined)
  React.useEffect(() => {
    window.clearTimeout(pendingSave.current)
    saved.current = given
  }, [given])
  React.useEffect(() => () => window.clearTimeout(pendingSave.current), [])

  function update(next: Draft, settle = true) {
    setDraft(next)
    window.clearTimeout(pendingSave.current)
    // A picker being dragged waits; anything else saves at once.
    if (settle) void save(next)
    else
      pendingSave.current = window.setTimeout(
        () => void save(next),
        SAVE_DELAY_MS
      )
  }

  async function save(next: Draft) {
    const response = await fetch(`/api/custom-presets/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ presetCode: next.code, colours: next.colours }),
    }).catch(() => null)
    if (response?.ok) {
      saved.current = next
      return
    }
    setDraft(saved.current)
    toast.error("That change didn’t save. Try again in a moment.")
  }

  if (!preset) return null
  const { colours: theme } = preset

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex h-12 shrink-0 items-center gap-2 border-b px-2 lg:px-3">
        {start}
        <span
          aria-hidden
          className="size-3 shrink-0 rounded-sm"
          style={{ background: theme.light.primary }}
        />
        <h2 className="truncate text-sm font-semibold">
          {canEdit ? "Your custom preset" : "Custom preset"}
        </h2>
        <code className="hidden font-mono text-xs text-muted-foreground sm:inline">
          {code}
        </code>
        <span className="flex-1" />
        <PresetVoteButton size="sm" code={code} />
        <PresetBlocksButton presetCode={code} />
        <PresetCodeButton
          presetCode={installablePresetCode(code)}
          customColours={
            hasColours(colours)
              ? {
                  css: preset.css,
                  registryUrl: `${origin}${customPresetRegistryPath(id)}`,
                }
              : undefined
          }
        />
        <PresetShareButton
          getUrl={() => `${origin}${customPresetPath(id, code)}`}
          onShare={() => trackEvent("custom_preset_share", {})}
        />
        {end}
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto lg:flex-row lg:overflow-hidden">
        <PreviewCanvas id={id} code={code} css={preset.css} />

        <aside
          aria-label="Customise"
          className="shrink-0 border-t lg:w-72 lg:overflow-y-auto lg:overscroll-contain lg:border-t-0 lg:border-l"
        >
          <CustomPresetProperties
            code={code}
            colours={colours}
            canEdit={canEdit}
            onValueChange={update}
          />
        </aside>
      </div>
    </div>
  )
}

/**
 * Create's preview of the preset. It loads once per view; after that every
 * change, its code (style, fonts, icons) and its colours alike, is sent in
 * and shown in place.
 */
function PreviewCanvas({
  id,
  code,
  css,
}: {
  id: string
  code: string
  css: string
}) {
  const [view, setView] = React.useState<PresetPreviewPageName>("preview")
  // The code the frame first loads with, kept until the view changes.
  const [loaded, setLoaded] = React.useState({ view, code })
  if (loaded.view !== view) setLoaded({ view, code })
  // The saved colours paint first; changes arrive as messages.
  const src = `${getPresetPreviewUrl(loaded.code, view)}&${new URLSearchParams({ custom: id })}`
  // Shown once it has taken the site's mode, which arrives after it loads:
  // until then it paints light, a flash on every change of style or font.
  const [shownSrc, setShownSrc] = React.useState<string | null>(null)
  const shown = shownSrc === src

  return (
    <div className="relative h-[70svh] shrink-0 bg-muted p-3 lg:h-auto lg:min-h-0 lg:flex-1 lg:p-5">
      <PresetV4Frame
        src={src}
        title="Your custom preset in create's preview"
        customColoursCss={css}
        presetCode={code}
        className={cn(
          "block size-full rounded-lg border bg-background shadow-lg transition-opacity duration-150",
          !shown && "opacity-0"
        )}
        onLoad={() => window.setTimeout(() => setShownSrc(src), 250)}
      />
      {shown ? null : (
        <div className="absolute inset-0 grid place-items-center">
          <Spinner />
        </div>
      )}
      {/* The same block views as a preset's page. */}
      <div className="absolute bottom-6 left-1/2 max-w-[calc(100%-2rem)] -translate-x-1/2 rounded-full border bg-popover p-1 shadow-md lg:bottom-8">
        <PresetPreviewLayoutPicker
          value={view}
          onValueChange={setView}
          presetCode={code}
        />
      </div>
    </div>
  )
}

