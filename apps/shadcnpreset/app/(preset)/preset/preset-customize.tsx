"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { useSearchParams } from "next/navigation"

import {
  useSaveCustomPreset,
  type SavedCustomPreset,
} from "@/components/custom-presets/use-save-custom-preset"
import { usePresetPageLive } from "@/components/preset-page-live-context"
import { NO_CUSTOM_COLOURS } from "@/lib/custom-colours"
import { buildCustomPreset } from "@/lib/custom-preset"
import {
  readPresetQuery,
  replaceQuery,
  samePreset,
  withoutArrival,
  withPresetDraft,
  type PresetDraft,
} from "@/lib/preset-draft"

type PresetCustomizeContextValue = {
  /** The preset as it stands, changes and all. */
  value: PresetDraft
  /** What it was before any changes: the preset, or the saved custom preset. */
  original: PresetDraft
  /** The saved custom preset on show, if any. */
  saved: SavedCustomPreset | null
  /** It differs from the original, and the difference isn't saved. */
  isChanged: boolean
  /** Colours for the preview as CSS; empty for a preset as it comes. */
  css: string
  /** `settle` is false while a picker is being dragged. */
  setValue: (next: PresetDraft, settle?: boolean) => void
  /** Back to the original. */
  reset: () => void
  /** Saves the changes, signing in first if need be. */
  save: () => void
  saving: boolean
}

const PresetCustomizeContext =
  React.createContext<PresetCustomizeContextValue | null>(null)

async function fetchSavedPreset(id: string): Promise<SavedCustomPreset> {
  const response = await fetch(`/api/custom-presets/${id}`)
  if (!response.ok) throw new Error("not found")
  return (await response.json()) as SavedCustomPreset
}

/**
 * Customizing the preset on show. Everything lives in the page's address
 * (see `lib/preset-draft`), and whether it has changed is worked out by
 * comparing it with the original, never remembered: changing a setting back
 * leaves nothing to save. A picker being dragged is held here until it
 * settles, so the address isn't rewritten on every frame.
 */
function PresetCustomizeProvider({ children }: { children: React.ReactNode }) {
  const { livePresetCode } = usePresetPageLive()
  const query = readPresetQuery(useSearchParams())

  const savedQuery = useQuery({
    queryKey: ["customPreset", query.custom],
    queryFn: () => fetchSavedPreset(query.custom!),
    enabled: Boolean(query.custom),
    retry: false,
    staleTime: Infinity,
  })
  const saved = (query.custom && savedQuery.data) || null

  const original = React.useMemo<PresetDraft>(
    () =>
      saved
        ? { code: saved.presetCode, colours: saved.colours }
        : { code: livePresetCode, colours: NO_CUSTOM_COLOURS },
    [saved, livePresetCode]
  )
  const [dragging, setDragging] = React.useState<PresetDraft | null>(null)
  const value = dragging ?? query.draft ?? original
  const isChanged = !samePreset(value, original)

  const plain = samePreset(value, {
    code: livePresetCode,
    colours: NO_CUSTOM_COLOURS,
  })
  const css = React.useMemo(
    () =>
      plain ? "" : (buildCustomPreset(value.code, value.colours)?.css ?? ""),
    [plain, value.code, value.colours]
  )

  const setValue = React.useCallback(
    (next: PresetDraft, settle = true) => {
      if (!settle) {
        setDragging(next)
        return
      }
      setDragging(null)
      replaceQuery(
        withPresetDraft(
          new URLSearchParams(window.location.search),
          samePreset(next, original) ? null : next
        )
      )
    },
    [original]
  )

  const reset = React.useCallback(() => {
    setDragging(null)
    replaceQuery(
      withPresetDraft(new URLSearchParams(window.location.search), null)
    )
  }, [])

  const { save: saveValue, saving } = useSaveCustomPreset()
  const save = React.useCallback(() => {
    if (isChanged) void saveValue(value, saved)
  }, [isChanged, saveValue, saved, value])

  // Back from signing in to save: it saves now, once, when the saved preset
  // it changes (if any) has arrived.
  const ready = !query.custom || !savedQuery.isPending
  const saveOnArrival = React.useEffectEvent(() => {
    replaceQuery(withoutArrival(new URLSearchParams(window.location.search)))
    save()
  })
  const arrived = React.useRef(false)
  React.useEffect(() => {
    if (!query.save || !ready || arrived.current) return
    arrived.current = true
    saveOnArrival()
  }, [query.save, ready])

  const context = React.useMemo(
    () => ({
      value,
      original,
      saved,
      isChanged,
      css,
      setValue,
      reset,
      save,
      saving,
    }),
    [value, original, saved, isChanged, css, setValue, reset, save, saving]
  )

  return (
    <PresetCustomizeContext.Provider value={context}>
      {children}
    </PresetCustomizeContext.Provider>
  )
}

function usePresetCustomize() {
  const context = React.useContext(PresetCustomizeContext)
  if (!context) {
    throw new Error(
      "usePresetCustomize must be used within a PresetCustomizeProvider."
    )
  }
  return context
}

export { PresetCustomizeProvider, usePresetCustomize }
