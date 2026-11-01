"use client"

import * as React from "react"

const PARAM = "preset"
/** Fired after this hook changes the address, which `popstate` does not cover. */
const CHANGE = "workspace-preset-change"

function subscribe(onChange: () => void) {
  window.addEventListener("popstate", onChange)
  window.addEventListener(CHANGE, onChange)
  return () => {
    window.removeEventListener("popstate", onChange)
    window.removeEventListener(CHANGE, onChange)
  }
}

function readParam() {
  return new URLSearchParams(window.location.search).get(PARAM)
}

function serverParam() {
  return null
}

function writeParam(id: string | null, how: "push" | "replace") {
  const url = new URL(window.location.href)
  if (id) url.searchParams.set(PARAM, id)
  else url.searchParams.delete(PARAM)
  if (how === "push") window.history.pushState(window.history.state, "", url)
  else window.history.replaceState(window.history.state, "", url)
  window.dispatchEvent(new Event(CHANGE))
}

/**
 * The custom preset open in the assistant's panel, kept in `?preset=` so a
 * reload or a shared link opens it again. Opening is a step Back undoes;
 * closing is not a step of its own.
 *
 * Read from the address rather than `useSearchParams`, which would hold the
 * whole page in Suspense. Moving to another chat drops the query, and the
 * panel with it, since the address is read on every render.
 */
export function useWorkspacePreset() {
  const id = React.useSyncExternalStore(subscribe, readParam, serverParam)
  // Until someone opens or closes it here, a panel is one they arrived with
  // (a reload, a link): shown in place, not slid in.
  const [moved, setMoved] = React.useState(false)

  const open = React.useCallback((next: string) => {
    setMoved(true)
    writeParam(next, "push")
  }, [])

  const close = React.useCallback(() => {
    setMoved(true)
    writeParam(null, "replace")
  }, [])

  return { id, instant: !moved, open, close }
}
