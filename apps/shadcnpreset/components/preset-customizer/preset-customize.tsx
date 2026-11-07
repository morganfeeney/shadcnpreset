"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"

import {
  useSaveCustomPreset,
  type SavedCustomPreset,
} from "@/components/custom-presets/use-save-custom-preset"
import { NO_CUSTOM_COLOURS } from "@/lib/custom-colours"
import { buildCustomPreset } from "@/lib/custom-preset"
import { useGeneratedPreview } from "@/lib/generated-preview/use-generated-preview"
import type { GeneratedPreviewPayload } from "@/lib/generated-preview/messages"
import {
  hasColours,
  readPresetQuery,
  replaceQuery,
  sameColours,
  samePreset,
  withColours,
  withoutArrival,
  withSavedPreset,
  withView,
  type PresetDraft,
} from "@/lib/preset-draft"
import type { PresetPreviewPageName } from "@/lib/preset-preview"

type PresetCustomizeContextValue = {
  /** The preset on show, with any custom colours. */
  value: PresetDraft
  /** The saved custom preset on show, if any. */
  saved: SavedCustomPreset | null
  /** Custom colours (or a saved preset's) differ from what is kept. */
  isChanged: boolean
  /** Colours for the preview as CSS; empty without custom colours. */
  css: string
  /** The block view it is shown in. */
  view: PresetPreviewPageName
  setView: (view: PresetPreviewPageName) => void
  /** A preview Ask AI generated this session, for the `generated` view. */
  generatedPreview: GeneratedPreviewPayload | null
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

/** A saved custom preset, read once and kept: saving updates it in place. */
function useSavedCustomPreset(id: string | null) {
  return useQuery({
    queryKey: ["customPreset", id],
    queryFn: () => fetchSavedPreset(id!),
    enabled: Boolean(id),
    retry: false,
    staleTime: Infinity,
  })
}

/**
 * Customizing a preset, the same wherever it is shown: the preset page and
 * Ask AI's panel. Everything lives in the page's address (`lib/preset-draft`);
 * each page gives the preset code, its query, and `goTo` to change either,
 * since only it knows where the code lives.
 *
 * A listed choice (style, base, theme, font and so on) is just another
 * preset, so it goes to that preset; only custom colours make a draft, kept
 * until saved. Whether anything has changed is worked out by comparing,
 * never remembered.
 */
function PresetCustomizeProvider({
  code,
  query,
  goTo,
  children,
}: {
  /** The preset on show. */
  code: string
  /** The page's address query. */
  query: URLSearchParams
  /** Shows a preset (this one or another) with the query given. */
  goTo: (code: string, query: URLSearchParams) => void
  children: React.ReactNode
}) {
  const read = readPresetQuery(query)

  const savedQuery = useSavedCustomPreset(read.custom)
  const saved = (read.custom && savedQuery.data) || null
  const keptColours = saved?.colours ?? NO_CUSTOM_COLOURS

  // A picker being dragged is held here until it settles, so the address
  // isn't rewritten on every frame.
  const [dragging, setDragging] = React.useState<PresetDraft["colours"] | null>(
    null
  )
  const queryColours = read.colours
  const value = React.useMemo<PresetDraft>(
    () => ({ code, colours: dragging ?? queryColours ?? keptColours }),
    [code, dragging, keptColours, queryColours]
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

  // `generated` only shows while Ask AI's preview is held this session.
  const generatedPreview = useGeneratedPreview()
  const view =
    read.view === "generated" && !generatedPreview ? "preview" : read.view

  // The address as it is now, which a handler reads rather than the render's.
  const current = () => new URLSearchParams(window.location.search)

  const setView = React.useCallback(
    (next: PresetPreviewPageName) => goTo(code, withView(current(), next)),
    [code, goTo]
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
      // Another code is another preset, with the colours carried over to it.
      goTo(next.code, withColours(current(), colours))
    },
    [goTo, keptColours]
  )

  const reset = React.useCallback(() => {
    setDragging(null)
    goTo(saved?.presetCode ?? code, withColours(current(), null))
  }, [code, goTo, saved])

  const { save: saveValue, saving } = useSaveCustomPreset()
  const save = React.useCallback(async () => {
    if (!isChanged) return
    const id = await saveValue(value, saved)
    if (id) goTo(value.code, withSavedPreset(current(), id))
  }, [goTo, isChanged, saveValue, saved, value])

  // Back from signing in to save: it saves now, once, when the saved preset
  // it changes (if any) has arrived.
  const ready = !read.custom || !savedQuery.isPending
  const saveOnArrival = React.useEffectEvent(() => {
    replaceQuery(withoutArrival(current()))
    void save()
  })
  const arrived = React.useRef(false)
  React.useEffect(() => {
    if (!read.save || !ready || arrived.current) return
    arrived.current = true
    saveOnArrival()
  }, [read.save, ready])

  const context = React.useMemo<PresetCustomizeContextValue>(
    () => ({
      value,
      saved,
      isChanged,
      css,
      view,
      setView,
      generatedPreview,
      setValue,
      reset,
      save: () => void save(),
      saving,
    }),
    [
      value,
      saved,
      isChanged,
      css,
      view,
      setView,
      generatedPreview,
      setValue,
      reset,
      save,
      saving,
    ]
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

export { PresetCustomizeProvider, usePresetCustomize, useSavedCustomPreset }
