"use client"

import * as React from "react"

import { NO_CUSTOM_COLOURS, type CustomColours } from "@/lib/custom-colours"
import { buildCustomPreset } from "@/lib/custom-preset"
import { useGeneratedPreview } from "@/lib/generated-preview/use-generated-preview"
import type { GeneratedPreviewPayload } from "@/lib/generated-preview/messages"
import {
  hasColours,
  readPresetQuery,
  withColours,
  withChat,
  withCustomizeTab,
  withSavedColours,
  withView,
  type CustomizeTab,
  type PresetDraft,
} from "@/lib/preset-draft"
import type { PresetPreviewPageName } from "@/lib/preset-preview"

type PresetCustomizeContextValue = {
  /** The preset on show, with any custom colours. */
  value: PresetDraft
  /** It has custom colours: what Reset takes away. */
  isChanged: boolean
  /** Colours for the preview as CSS; empty without custom colours. */
  css: string
  /** The block view it is shown in. */
  view: PresetPreviewPageName
  setView: (view: PresetPreviewPageName) => void
  /** Customize's tab, where it has more than one (the preset page). */
  tab: CustomizeTab
  setTab: (tab: CustomizeTab) => void
  /** The conversation in the Ask AI tab, kept in the address. */
  chat: string | null
  setChat: (chat: string | null) => void
  /** A preview Ask AI generated this session, for the `generated` view. */
  generatedPreview: GeneratedPreviewPayload | null
  /**
   * `settle` is false while a picker is being dragged. `chat` goes in the
   * address with it, in one step: a second would race the preset's own.
   */
  setValue: (next: PresetDraft, settle?: boolean, chat?: string | null) => void
  /** Back to the preset as it comes. */
  reset: () => void
}

const PresetCustomizeContext =
  React.createContext<PresetCustomizeContextValue | null>(null)

/**
 * An old link's saved preset, by id: its preset and colours, to show by the
 * address as anything else is. Null when it is gone.
 */
async function fetchSavedColours(
  id: string
): Promise<{ presetCode: string; colours: CustomColours } | null> {
  const response = await fetch(`/api/custom-presets/${id}`).catch(() => null)
  if (!response?.ok) return null
  return (await response.json()) as {
    presetCode: string
    colours: CustomColours
  }
}

/**
 * Customizing a preset, the same wherever it is shown: the preset page and
 * Ask AI's panel. Everything lives in the page's address (`lib/preset-draft`);
 * each page gives the preset code, its query, and `goTo` to change either,
 * since only it knows where the code lives.
 *
 * A listed choice (style, base, theme, font and so on) is just another
 * preset, so it goes to that preset; only custom colours make it custom.
 * Nothing is stored: the address is the preset, to share or install.
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

  // A picker being dragged is held here until it settles, so the address
  // isn't rewritten on every frame.
  const [dragging, setDragging] = React.useState<PresetDraft["colours"] | null>(
    null
  )
  const queryColours = read.colours
  const value = React.useMemo<PresetDraft>(
    () => ({ code, colours: dragging ?? queryColours ?? NO_CUSTOM_COLOURS }),
    [code, dragging, queryColours]
  )
  const isChanged = hasColours(value.colours)

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

  const tab = read.tab
  const setTab = React.useCallback(
    (next: CustomizeTab) => goTo(code, withCustomizeTab(current(), next)),
    [code, goTo]
  )

  const chat = read.chat
  const setChat = React.useCallback(
    (next: string | null) => goTo(code, withChat(current(), next)),
    [code, goTo]
  )

  const setView = React.useCallback(
    (next: PresetPreviewPageName) => goTo(code, withView(current(), next)),
    [code, goTo]
  )

  const setValue = React.useCallback(
    (next: PresetDraft, settle = true, chat?: string | null) => {
      if (!settle) {
        setDragging(next.colours)
        return
      }
      setDragging(null)
      const colours = hasColours(next.colours) ? next.colours : null
      // Another code is another preset, with the colours carried over to it.
      const address = withColours(current(), colours)
      goTo(next.code, chat === undefined ? address : withChat(address, chat))
    },
    [goTo]
  )

  const reset = React.useCallback(() => {
    setDragging(null)
    goTo(code, withColours(current(), null))
  }, [code, goTo])

  // An old link names a saved preset: shown as its preset and colours in
  // the address, like any other, once read.
  const legacy = read.custom
  React.useEffect(() => {
    if (!legacy) return
    let active = true
    void fetchSavedColours(legacy).then((saved) => {
      if (!active) return
      const address = new URLSearchParams(window.location.search)
      if (!saved) {
        goTo(code, withSavedColours(address, null))
        return
      }
      goTo(
        saved.presetCode,
        withSavedColours(
          address,
          hasColours(saved.colours) ? saved.colours : null
        )
      )
    })
    return () => {
      active = false
    }
  }, [code, goTo, legacy])

  const context = React.useMemo<PresetCustomizeContextValue>(
    () => ({
      value,
      isChanged,
      css,
      view,
      setView,
      tab,
      setTab,
      chat,
      setChat,
      generatedPreview,
      setValue,
      reset,
    }),
    [
      value,
      isChanged,
      css,
      view,
      setView,
      tab,
      setTab,
      chat,
      setChat,
      generatedPreview,
      setValue,
      reset,
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

export { PresetCustomizeProvider, usePresetCustomize }
