"use client"

import * as React from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"

import type { GeneratedPreviewPayload } from "@/lib/generated-preview/messages"
import {
  getGeneratedPreviewServerSnapshot,
  getGeneratedPreviewSnapshot,
  subscribeToGeneratedPreview,
} from "@/lib/generated-preview/store"
import {
  parsePresetPreviewPageName,
  presetBrowsePath,
  type PresetPreviewPageName,
} from "@/lib/preset-preview"
import { syncPresetPageSocialMeta } from "@/lib/sync-preset-social-meta"

type PresetPageLiveContextValue = {
  livePresetCode: string
  view: PresetPreviewPageName
  /**
   * A preview generated in Ask AI, held for this session. Ask AI stores it as
   * it links here, so the generated view has something to show.
   */
  generatedPreview: GeneratedPreviewPayload | null
  selectLivePreset: (preset: string) => void
  setLiveView: (view: PresetPreviewPageName) => void
}

const PresetPageLiveContext =
  React.createContext<PresetPageLiveContextValue | null>(null)

export function PresetPageLiveProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const params = useParams<{ code: string }>()
  const searchParams = useSearchParams()
  const livePresetCode = params.code ?? ""
  const view = parsePresetPreviewPageName(searchParams.get("view"))
  // Session-scoped and client-only: the server snapshot is null so hydration
  // matches, then React swaps in any preview stored earlier this session.
  const generatedPreview = React.useSyncExternalStore(
    subscribeToGeneratedPreview,
    getGeneratedPreviewSnapshot,
    getGeneratedPreviewServerSnapshot
  )

  const selectLivePreset = React.useCallback(
    (preset: string) => {
      if (preset === livePresetCode) return
      router.push(presetBrowsePath(preset, view), { scroll: false })
    },
    [livePresetCode, router, view]
  )

  const setLiveView = React.useCallback(
    (next: PresetPreviewPageName) => {
      if (next === view) return
      // A draft in the address stays with the preset as its view changes.
      router.replace(
        presetBrowsePath(
          livePresetCode,
          next,
          new URLSearchParams(window.location.search)
        ),
        { scroll: false }
      )
    },
    [livePresetCode, router, view]
  )

  React.useEffect(() => {
    if (!livePresetCode) return
    void syncPresetPageSocialMeta(livePresetCode)
  }, [livePresetCode])

  const value = React.useMemo(
    () => ({
      livePresetCode,
      view,
      generatedPreview,
      selectLivePreset,
      setLiveView,
    }),
    [livePresetCode, view, generatedPreview, selectLivePreset, setLiveView]
  )

  return (
    <PresetPageLiveContext.Provider value={value}>
      {children}
    </PresetPageLiveContext.Provider>
  )
}

export function usePresetPageLive() {
  const context = React.useContext(PresetPageLiveContext)
  if (!context) {
    throw new Error("usePresetPageLive must be used within PresetPageLiveProvider")
  }
  return context
}

export function usePresetPageLiveOptional() {
  return React.useContext(PresetPageLiveContext)
}
