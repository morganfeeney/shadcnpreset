"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"

import { useSaveCustomPreset } from "@/components/custom-presets/use-save-custom-preset"
import { usePresetPageLive } from "@/components/preset-page-live-context"
import { NO_CUSTOM_COLOURS } from "@/lib/custom-colours"
import { buildCustomPreset } from "@/lib/custom-preset"
import {
  readPresetDraft,
  replaceQuery,
  withoutArrival,
  withPresetDraft,
  type PresetDraft,
} from "@/lib/preset-draft"

type PresetCustomizeContextValue = {
  /** The preset as it stands: the live one, or the draft made from it. */
  value: PresetDraft
  /** Something has been changed, and is not saved. */
  isDraft: boolean
  /** The draft's colours as CSS for the preview; empty without a draft. */
  css: string
  setValue: (next: PresetDraft) => void
  /** Saves the draft, signing in first if need be. */
  save: () => void
  saving: boolean
}

const PresetCustomizeContext =
  React.createContext<PresetCustomizeContextValue | null>(null)

/**
 * Customizing the preset on show. A change makes a draft of it, which the
 * preview shows in place and the address keeps; choosing another preset
 * leaves the draft behind. Back from signing in to save, it saves.
 */
function PresetCustomizeProvider({ children }: { children: React.ReactNode }) {
  const { livePresetCode } = usePresetPageLive()
  const searchParams = useSearchParams()
  const [arrival] = React.useState(() => readPresetDraft(searchParams))
  const [state, setState] = React.useState<{
    base: string
    draft: PresetDraft | null
  }>({ base: livePresetCode, draft: arrival.draft })
  if (state.base !== livePresetCode) {
    setState({ base: livePresetCode, draft: null })
  }

  const draft = state.base === livePresetCode ? state.draft : null
  const value = React.useMemo(
    () => draft ?? { code: livePresetCode, colours: NO_CUSTOM_COLOURS },
    [draft, livePresetCode]
  )
  const css = React.useMemo(
    () => (draft ? (buildCustomPreset(draft.code, draft.colours)?.css ?? "") : ""),
    [draft]
  )
  const setValue = React.useCallback((next: PresetDraft) => {
    setState((current) => ({ base: current.base, draft: next }))
    replaceQuery(
      withPresetDraft(new URLSearchParams(window.location.search), next)
    )
  }, [])

  const { save: saveDraft, saving } = useSaveCustomPreset()
  const save = React.useCallback(() => void saveDraft(value), [saveDraft, value])

  // Back from signing in to save: it saves now, once.
  const saveOnArrival = React.useEffectEvent(() => {
    replaceQuery(withoutArrival(new URLSearchParams(window.location.search)))
    if (arrival.draft) void saveDraft(arrival.draft)
  })
  const arrived = React.useRef(false)
  React.useEffect(() => {
    if (!arrival.save || arrived.current) return
    arrived.current = true
    saveOnArrival()
  }, [arrival.save])

  const context = React.useMemo(
    () => ({ value, isDraft: Boolean(draft), css, setValue, save, saving }),
    [value, draft, css, setValue, save, saving]
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
