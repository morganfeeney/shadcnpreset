"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"

import { syncPresetPageSocialMeta } from "@/lib/sync-preset-social-meta"

type PresetPageLiveContextValue = {
  /** The preset the page shows, from its address. */
  livePresetCode: string
  /** Moves to another preset, in the same view. */
  selectLivePreset: (preset: string) => void
}

const PresetPageLiveContext =
  React.createContext<PresetPageLiveContextValue | null>(null)

/**
 * The preset page's preset, from its path. Choosing another moves to its
 * page, in the view on show and without anything customized on this one.
 */
export function PresetPageLiveProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const params = useParams<{ code: string }>()
  const livePresetCode = params.code ?? ""

  const selectLivePreset = React.useCallback(
    (preset: string) => {
      if (preset === livePresetCode) return
      const view = new URLSearchParams(window.location.search).get("view")
      const query = view ? `?${new URLSearchParams({ view })}` : ""
      router.push(`/preset/${preset}${query}`, { scroll: false })
    },
    [livePresetCode, router]
  )

  React.useEffect(() => {
    if (!livePresetCode) return
    void syncPresetPageSocialMeta(livePresetCode)
  }, [livePresetCode])

  const value = React.useMemo(
    () => ({ livePresetCode, selectLivePreset }),
    [livePresetCode, selectLivePreset]
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
