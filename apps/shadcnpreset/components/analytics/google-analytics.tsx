"use client"

import { GoogleAnalytics as Ga4 } from "@next/third-parties/google"
import { useSyncExternalStore } from "react"
import { siteConfig } from "@/lib/config"

function subscribeToNothing() {
  return () => {}
}

function getIsTopWindowSnapshot() {
  if (typeof window === "undefined") return false
  try {
    return window.self === window.top
  } catch {
    return false
  }
}

export function GoogleAnalytics() {
  const { analytics } = siteConfig

  const gaId = analytics.googleAnalyticsId
  const isTopWindow = useSyncExternalStore(
    subscribeToNothing,
    getIsTopWindowSnapshot,
    () => false
  )

  if (process.env.NODE_ENV !== "production" || !gaId) {
    return null
  }

  if (!isTopWindow) return null

  return <Ga4 gaId={gaId} />
}
