"use client"

import * as React from "react"

import { useAddressQuery } from "@/hooks/use-address-query"
import type { CustomColours } from "@/lib/custom-colours"
import { resolvePresetFromCode } from "@/lib/preset"
import {
  replaceQuery,
  withColours,
  withoutChanges,
  withoutCustomizing,
  withSavedPreset,
} from "@/lib/preset-draft"

const PARAM = "preset"

/**
 * The preset open beside Ask AI's chat to customize, kept in `?preset=` with
 * the rest of customizing (`lib/preset-draft`), so a reload or a shared link
 * opens it again. Opening is a step Back undoes; switching to another preset
 * and closing are not steps of their own.
 *
 * Read from the address rather than `useSearchParams`, which would hold the
 * whole page in Suspense. Moving to another chat drops the query, and the
 * panel with it, since the address is read on every render.
 */
export function useWorkspacePreset() {
  const query = useAddressQuery()
  const named = query.get(PARAM)
  const code = named && resolvePresetFromCode(named) ? named : null
  // Until someone opens or closes it here, a panel is one they arrived with
  // (a reload, a link): shown in place, not slid in.
  const [moved, setMoved] = React.useState(false)

  // Links from before named a saved custom preset by its id: shown by its
  // preset, as the panel names them now.
  const legacyId = named && !code ? named : null
  React.useEffect(() => {
    if (!legacyId) return
    let active = true
    void fetch(`/api/custom-presets/${legacyId}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((saved: { presetCode?: string } | null) => {
        if (!active) return
        const address = new URLSearchParams(window.location.search)
        const next = saved?.presetCode
          ? withSavedPreset(address, legacyId)
          : withoutCustomizing(address)
        if (saved?.presetCode) next.set(PARAM, saved.presetCode)
        else next.delete(PARAM)
        replaceQuery(next)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [legacyId])

  /**
   * Shows a preset, with any colours to start from as unsaved changes. Opens
   * the panel as a step of its own, and says so; with it open, it switches
   * in place.
   */
  const show = React.useCallback(
    (next: string, colours: CustomColours | null = null): boolean => {
      const current = new URLSearchParams(window.location.search)
      const opening = !current.get(PARAM)
      const fresh = opening
        ? withoutCustomizing(current)
        : withoutChanges(current)
      fresh.set(PARAM, next)
      setMoved(true)
      replaceQuery(withColours(fresh, colours), opening ? "push" : "replace")
      return opening
    },
    []
  )

  /** The customizer's `goTo`: this preset or another, with the query given. */
  const goTo = React.useCallback(
    (next: string, nextQuery: URLSearchParams) => {
      const search = new URLSearchParams(nextQuery)
      search.set(PARAM, next)
      replaceQuery(search)
    },
    []
  )

  const close = React.useCallback(() => {
    const next = withoutCustomizing(new URLSearchParams(window.location.search))
    next.delete(PARAM)
    setMoved(true)
    replaceQuery(next)
  }, [])

  return { code, query, instant: !moved, show, goTo, close }
}
