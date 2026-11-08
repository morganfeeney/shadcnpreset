"use client"

import * as React from "react"

import { ADDRESS_CHANGE_EVENT } from "@/lib/preset-draft"

function subscribe(onChange: () => void) {
  window.addEventListener("popstate", onChange)
  window.addEventListener(ADDRESS_CHANGE_EVENT, onChange)
  return () => {
    window.removeEventListener("popstate", onChange)
    window.removeEventListener(ADDRESS_CHANGE_EVENT, onChange)
  }
}

/**
 * The page's query, read from the address itself. For a page that can't be
 * held in Suspense as `useSearchParams` would hold it (Ask AI): it follows
 * the back button and `replaceQuery`, and is empty on the server.
 */
export function useAddressQuery() {
  const search = React.useSyncExternalStore(
    subscribe,
    () => window.location.search,
    () => ""
  )
  return React.useMemo(() => new URLSearchParams(search), [search])
}
