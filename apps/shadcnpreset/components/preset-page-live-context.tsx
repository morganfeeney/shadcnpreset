"use client"

import * as React from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { decodePreset, encodePreset } from "shadcn/preset"

import type { GeneratedPreviewPayload } from "@/lib/generated-preview/messages"
import {
  getGeneratedPreviewServerSnapshot,
  getGeneratedPreviewSnapshot,
  setStoredGeneratedPreview,
  subscribeToGeneratedPreview,
} from "@/lib/generated-preview/store"
import {
  parsePresetPreviewPageName,
  parsePresetSidebarTab,
  presetBrowsePath,
  PRESET_CHAT_PARAM,
  type PresetPreviewPageName,
  type PresetSidebarTab,
} from "@/lib/preset-preview"
import { syncPresetPageSocialMeta } from "@/lib/sync-preset-social-meta"

type PresetPageLiveContextValue = {
  livePresetCode: string
  canonicalPresetCode: string
  view: PresetPreviewPageName
  tab: PresetSidebarTab
  generatedPreview: GeneratedPreviewPayload | null
  /**
   * A generated view was linked to, and its preview is still being recovered
   * from the chat in the URL. The tab and the pane hold their shape for this
   * window rather than falling back to the default view and snapping back.
   */
  generatedPreviewPending: boolean
  onPresetFromIframe: (preset: string) => void
  selectLivePreset: (preset: string) => void
  setLiveView: (view: PresetPreviewPageName) => void
  setLiveTab: (tab: PresetSidebarTab) => void
  setGeneratedPreview: (preview: GeneratedPreviewPayload | null) => void
  /**
   * Shows a generated preview in the main pane, switching preset when the
   * preview names a different one (e.g. "show buttons with preset b0"). One
   * navigation, so preset and view cannot race each other.
   */
  showGeneratedPreview: (
    preview: GeneratedPreviewPayload & { presetCode?: string }
  ) => void
}

/** How long to wait for a linked chat before giving up on its preview. */
const GENERATED_PREVIEW_RESTORE_TIMEOUT_MS = 8000

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
  // Session-scoped and client-only: the server snapshot is null so hydration
  // matches, then React swaps in any preview stored earlier this session.
  const generatedPreview = React.useSyncExternalStore(
    subscribeToGeneratedPreview,
    getGeneratedPreviewSnapshot,
    getGeneratedPreviewServerSnapshot
  )

  // Bounded: a chat that never arrives — signed out, deleted, a bad id — must
  // not leave the pane spinning. On timeout the view falls back as before.
  const wantsRestore =
    view === "generated" && Boolean(searchParams.get(PRESET_CHAT_PARAM))
  const [restoreTimedOut, setRestoreTimedOut] = React.useState(false)

  React.useEffect(() => {
    if (!wantsRestore) return
    const id = window.setTimeout(
      () => setRestoreTimedOut(true),
      GENERATED_PREVIEW_RESTORE_TIMEOUT_MS
    )
    return () => window.clearTimeout(id)
  }, [wantsRestore])

  const generatedPreviewPending =
    wantsRestore && !generatedPreview && !restoreTimedOut

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

  const setGeneratedPreview = React.useCallback(
    (preview: GeneratedPreviewPayload | null) => {
      setStoredGeneratedPreview(preview)
    },
    []
  )

  const showGeneratedPreview = React.useCallback(
    (preview: GeneratedPreviewPayload & { presetCode?: string }) => {
      setStoredGeneratedPreview({ title: preview.title, code: preview.code })
      const nextCode = preview.presetCode ?? livePresetCode
      router.replace(presetBrowsePath(nextCode, "generated", tab), {
        scroll: false,
      })
    },
    [livePresetCode, router, tab]
  )

  const value = React.useMemo(
    () => ({
      livePresetCode,
      canonicalPresetCode,
      view,
      tab,
      generatedPreview,
      generatedPreviewPending,
      onPresetFromIframe,
      selectLivePreset,
      setLiveView,
      setLiveTab,
      setGeneratedPreview,
      showGeneratedPreview,
    }),
    [
      livePresetCode,
      canonicalPresetCode,
      view,
      tab,
      generatedPreview,
      generatedPreviewPending,
      onPresetFromIframe,
      selectLivePreset,
      setLiveView,
      setLiveTab,
      setGeneratedPreview,
      showGeneratedPreview,
    ]
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
