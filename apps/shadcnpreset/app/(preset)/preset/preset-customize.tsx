"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { useRouter, useSearchParams } from "next/navigation"

import {
  useSaveCustomPreset,
  type SavedCustomPreset,
} from "@/components/custom-presets/use-save-custom-preset"
import { usePresetPageLive } from "@/components/preset-page-live-context"
import { NO_CUSTOM_COLOURS } from "@/lib/custom-colours"
import { buildCustomPreset } from "@/lib/custom-preset"
import {
  customPresetPath,
  hasColours,
  readPresetQuery,
  replaceQuery,
  sameColours,
  samePreset,
  withColours,
  withoutArrival,
  type PresetDraft,
} from "@/lib/preset-draft"

type PresetCustomizeContextValue = {
  /** The preset on show, with any custom colours. */
  value: PresetDraft
  /** The saved custom preset on show, if any. */
  saved: SavedCustomPreset | null
  /** Custom colours (or a saved preset's) differ from what is kept. */
  isChanged: boolean
  /** Colours for the preview as CSS; empty without custom colours. */
  css: string
  /** `settle` is false while a picker is being dragged. */
  setValue: (next: PresetDraft, settle?: boolean) => void
  /** Back to the preset as it comes, or as saved. */
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
 * Customizing the preset on show. A listed choice (style, base, theme, font
 * and so on) is just another preset, so it moves to that preset's page; only
 * custom colours make a draft, kept in the address until saved. Whether
 * anything has changed is worked out by comparing, never remembered.
 */
function PresetCustomizeProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
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
  const keptColours = saved?.colours ?? NO_CUSTOM_COLOURS

  // A picker being dragged is held here until it settles, so the address
  // isn't rewritten on every frame.
  const [dragging, setDragging] = React.useState<PresetDraft["colours"] | null>(
    null
  )
  const value = React.useMemo<PresetDraft>(
    () => ({
      code: livePresetCode,
      colours: dragging ?? query.colours ?? keptColours,
    }),
    [dragging, keptColours, livePresetCode, query.colours]
  )
  const isChanged = saved
    ? !samePreset(value, { code: saved.presetCode, colours: saved.colours })
    : hasColours(value.colours)

  const css = React.useMemo(
    () =>
      hasColours(value.colours)
        ? (buildCustomPreset(value.code, value.colours)?.css ?? "")
        : "",
    [value]
  )

  const setValue = React.useCallback(
    (next: PresetDraft, settle = true) => {
      if (!settle) {
        setDragging(next.colours)
        return
      }
      setDragging(null)
      const colours = sameColours(next.colours, keptColours)
        ? null
        : next.colours
      const search = withColours(
        new URLSearchParams(window.location.search),
        colours
      )
      if (next.code === livePresetCode) {
        replaceQuery(search)
        return
      }
      // Another preset, with the colours carried over to it.
      const query = search.toString()
      router.replace(`/preset/${next.code}${query ? `?${query}` : ""}`, {
        scroll: false,
      })
    },
    [keptColours, livePresetCode, router]
  )

  // Back to what is kept: the preset as it comes, or the saved preset.
  const reset = React.useCallback(() => {
    setDragging(null)
    if (saved && saved.presetCode !== livePresetCode) {
      router.replace(customPresetPath(saved.id, saved.presetCode), {
        scroll: false,
      })
      return
    }
    replaceQuery(withColours(new URLSearchParams(window.location.search), null))
  }, [livePresetCode, router, saved])

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
    () => ({ value, saved, isChanged, css, setValue, reset, save, saving }),
    [value, saved, isChanged, css, setValue, reset, save, saving]
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
