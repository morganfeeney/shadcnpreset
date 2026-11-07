"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"

import { useStoredWorkspaceOpen } from "@/hooks/use-stored-workspace-open"
import {
  readPresetQuery,
  replaceQuery,
  withoutArrival,
} from "@/lib/preset-draft"

/**
 * Which of the preset page's panels are open, for its `WorkspaceProvider`:
 * as they were last left, with Customize open on arriving from a card's
 * Customize, on a phone too. Arriving that way is kept, and the address
 * tidied.
 */
export function usePresetWorkspace() {
  const [stored, setStored] = useStoredWorkspaceOpen("preset-workspace")
  const customize = readPresetQuery(useSearchParams()).customize
  const open = customize ? { ...stored, end: true } : stored

  const keepArrival = React.useEffectEvent(() => {
    setStored(open)
    replaceQuery(withoutArrival(new URLSearchParams(window.location.search)))
  })
  React.useEffect(() => {
    if (customize) keepArrival()
  }, [customize])

  // Read as the page first draws, before it is known to be a phone.
  const [defaultOpenMobile] = React.useState({ start: false, end: customize })

  return { open, onOpenChange: setStored, defaultOpenMobile }
}
