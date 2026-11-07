"use client"

import * as React from "react"

import type { WorkspaceOpen } from "@/components/workspace"

const CHANGE = "workspace-open-change"
const BOTH_OPEN: WorkspaceOpen = { start: true, end: true }

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange)
  window.addEventListener(CHANGE, onChange)
  return () => {
    window.removeEventListener("storage", onChange)
    window.removeEventListener(CHANGE, onChange)
  }
}

function read(key: string) {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function parse(raw: string | null): WorkspaceOpen {
  if (!raw) return BOTH_OPEN
  try {
    const value = JSON.parse(raw) as Partial<WorkspaceOpen>
    return {
      start: typeof value.start === "boolean" ? value.start : true,
      end: typeof value.end === "boolean" ? value.end : true,
    }
  } catch {
    return BOTH_OPEN
  }
}

/**
 * Which of a workspace's panels are open, remembered per browser, for its
 * `open` and `onOpenChange`. Both start open; without storage they are
 * kept for the visit, and start open again next time.
 */
export function useStoredWorkspaceOpen(key: string) {
  const stored = React.useSyncExternalStore(
    subscribe,
    () => read(key),
    () => null
  )
  const [unstored, setUnstored] = React.useState<WorkspaceOpen | null>(null)
  const parsed = React.useMemo(() => parse(stored), [stored])
  const open = unstored ?? parsed

  const setOpen = React.useCallback(
    (next: WorkspaceOpen) => {
      try {
        window.localStorage.setItem(key, JSON.stringify(next))
        window.dispatchEvent(new Event(CHANGE))
      } catch {
        setUnstored(next)
      }
    },
    [key]
  )

  return [open, setOpen] as const
}
