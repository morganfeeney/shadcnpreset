"use client"

import * as React from "react"
import { decodePreset, encodePreset } from "shadcn/preset"

import {
  parsePresetPreviewPageName,
  parsePresetSidebarTab,
  presetBrowsePath,
} from "@/lib/preset-preview"
import { parsePresetCodeFromPathname } from "@/lib/preset-route"
import { syncPresetPageSocialMeta } from "@/lib/sync-preset-social-meta"

type PresetPageLiveContextValue = {
  livePresetCode: string
  /** Normalized preset string for vote/share APIs */
  canonicalPresetCode: string
  onPresetFromIframe: (preset: string) => void
  /** Swap the live preset without a Next.js page navigation. */
  selectLivePreset: (preset: string) => void
}

const PresetPageLiveContext =
  React.createContext<PresetPageLiveContextValue | null>(null)

function normalizeCanonical(code: string): string {
  const decoded = decodePreset(code)
  return decoded ? encodePreset(decoded) : code
}

function writePresetPath(preset: string, historyMode: "push" | "replace") {
  const params = new URLSearchParams(window.location.search)
  const path = presetBrowsePath(
    preset,
    parsePresetPreviewPageName(params.get("view")),
    parsePresetSidebarTab(params.get("tab"))
  )
  if (historyMode === "push") {
    window.history.pushState(window.history.state, "", path)
    return
  }
  window.history.replaceState(window.history.state, "", path)
}

export function PresetPageLiveProvider({
  initialPresetCode,
  children,
}: {
  initialPresetCode: string
  children: React.ReactNode
}) {
  const [livePresetCode, setLivePresetCode] = React.useState(initialPresetCode)
  const [syncedInitialCode, setSyncedInitialCode] =
    React.useState(initialPresetCode)
  const liveCodeRef = React.useRef(livePresetCode)

  if (initialPresetCode !== syncedInitialCode) {
    setSyncedInitialCode(initialPresetCode)
    setLivePresetCode(initialPresetCode)
  }

  React.useEffect(() => {
    liveCodeRef.current = livePresetCode
  }, [livePresetCode])

  const canonicalPresetCode = React.useMemo(
    () => normalizeCanonical(livePresetCode),
    [livePresetCode]
  )

  const onPresetFromIframe = React.useCallback((preset: string) => {
    liveCodeRef.current = preset
    setLivePresetCode(preset)
    writePresetPath(preset, "replace")
  }, [])

  const selectLivePreset = React.useCallback((preset: string) => {
    if (liveCodeRef.current === preset) return
    liveCodeRef.current = preset
    setLivePresetCode(preset)
    writePresetPath(preset, "push")
  }, [])

  React.useEffect(() => {
    function onPopState() {
      const code = parsePresetCodeFromPathname(window.location.pathname)
      if (code) setLivePresetCode(code)
    }

    window.addEventListener("popstate", onPopState)
    return () => window.removeEventListener("popstate", onPopState)
  }, [])

  React.useEffect(() => {
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
      onPresetFromIframe,
      selectLivePreset,
    }),
    [livePresetCode, canonicalPresetCode, onPresetFromIframe, selectLivePreset]
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
