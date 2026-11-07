"use client"

import * as React from "react"

import {
  getGeneratedPreviewServerSnapshot,
  getGeneratedPreviewSnapshot,
  subscribeToGeneratedPreview,
} from "@/lib/generated-preview/store"

/**
 * The preview Ask AI generated this session, held so the `generated` view
 * has something to show. Client-only: the server snapshot is null so
 * hydration matches, then React swaps in any preview stored earlier.
 */
export function useGeneratedPreview() {
  return React.useSyncExternalStore(
    subscribeToGeneratedPreview,
    getGeneratedPreviewSnapshot,
    getGeneratedPreviewServerSnapshot
  )
}
