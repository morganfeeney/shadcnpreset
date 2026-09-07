"use client"

import * as React from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { decodePreset, encodePreset } from "shadcn/preset"

import {
  parsePresetPreviewPageName,
  parsePresetSidebarTab,
  presetBrowsePath,
  type PresetPreviewPageName,
  type PresetSidebarTab,
} from "@/lib/preset-preview"
import { syncPresetPageSocialMeta } from "@/lib/sync-preset-social-meta"

type PresetPageLiveContextValue = {
  livePresetCode: string
  canonicalPresetCode: string
  view: PresetPreviewPageName
  tab: PresetSidebarTab
  onPresetFromIframe: (preset: string) => void
  selectLivePreset: (preset: string) => void
  setLiveView: (view: PresetPreviewPageName) => void
  setLiveTab: (tab: PresetSidebarTab) => void
}

const PresetPageLiveContext =
  React.createContext<PresetPageLiveContextValue | null>(null)

function normalizeCanonical(code: string): string {
  const decoded = decodePreset(code)
  return decoded ? encodePreset(decoded) : code
}

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
  const tab = parsePresetSidebarTab(searchParams.get("tab"))

  const canonicalPresetCode = React.useMemo(
    () => normalizeCanonical(livePresetCode),
    [livePresetCode]
  )

  const selectLivePreset = React.useCallback(
    (preset: string) => {
      if (preset === livePresetCode) return
      router.push(presetBrowsePath(preset, view, tab), { scroll: false })
    },
    [livePresetCode, router, tab, view]
  )

  const onPresetFromIframe = React.useCallback(
    (preset: string) => {
      if (preset === livePresetCode) return
      router.replace(presetBrowsePath(preset, view, tab), { scroll: false })
    },
    [livePresetCode, router, tab, view]
  )

  const setLiveView = React.useCallback(
    (next: PresetPreviewPageName) => {
      if (next === view) return
      router.replace(presetBrowsePath(livePresetCode, next, tab), {
        scroll: false,
      })
    },
    [livePresetCode, router, tab, view]
  )

  const setLiveTab = React.useCallback(
    (next: PresetSidebarTab) => {
      if (next === tab) return
      router.replace(presetBrowsePath(livePresetCode, view, next), {
        scroll: false,
      })
    },
    [livePresetCode, router, tab, view]
  )

  React.useEffect(() => {
    if (!livePresetCode) return
    let cancelled = false

    void (async () => {
      await syncPresetPageSocialMeta(livePresetCode)
      if (cancelled) {
        return
      }
    })()

    return () => {
      cancelled = true
    }
  }, [livePresetCode])

  const value = React.useMemo(
    () => ({
      livePresetCode,
      canonicalPresetCode,
      view,
      tab,
      onPresetFromIframe,
      selectLivePreset,
      setLiveView,
      setLiveTab,
    }),
    [
      livePresetCode,
      canonicalPresetCode,
      view,
      tab,
      onPresetFromIframe,
      selectLivePreset,
      setLiveView,
      setLiveTab,
    ]
  )

  return (
    <PresetPageLiveContext.Provider value={value}>
      {children}
    </PresetPageLiveContext.Provider>
  )
}

export function usePresetPageLiveOptional() {
  return React.useContext(PresetPageLiveContext)
}
