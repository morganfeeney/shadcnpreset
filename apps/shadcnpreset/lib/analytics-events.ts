import { sendGAEvent } from "@next/third-parties/google"

import { siteConfig } from "@/lib/config"

function isGaEnabled(): boolean {
  if (typeof window === "undefined") return false
  if (process.env.NODE_ENV !== "production") return false
  if (!siteConfig.analytics.googleAnalyticsId) return false
  try {
    return window.self === window.top
  } catch {
    return false
  }
}

function gaEvent(eventName: string, params?: Record<string, string | number>) {
  if (!isGaEnabled()) return
  sendGAEvent("event", eventName, params ?? {})
}

export function trackSearchSubmit(args: {
  pagePath: string
  mode: "code" | "smart"
  /** Trimmed query as submitted (GA4 `search_term`). */
  searchTerm: string
  /** When set, indicates the query came from the AI assistant flow. */
  source?: "ai_assistant"
}) {
  gaEvent("search_submit", {
    page_path: args.pagePath,
    search_mode: args.mode,
    search_term: args.searchTerm,
    ...(args.source ? { search_source: args.source } : {}),
  })
}

export function trackAiSearchAssistant(args: { pagePath: string }) {
  gaEvent("ai_search_assistant", {
    page_path: args.pagePath,
  })
}

export function trackFeedLoadMore(args: {
  pagePath: string
  batchSize: number
}) {
  gaEvent("feed_load_more", {
    page_path: args.pagePath,
    batch_size: args.batchSize,
  })
}

export function trackPresetPreview(args: {
  pagePath: string
  presetCode: string
}) {
  gaEvent("preset_preview", {
    page_path: args.pagePath,
    preset_code: args.presetCode,
  })
}

export function trackPresetEditClick(args: {
  pagePath: string
  presetCode: string
}) {
  gaEvent("preset_edit_click", {
    page_path: args.pagePath,
    preset_code: args.presetCode,
  })
}

export function trackPresetVoteClick(args: {
  pagePath: string
  presetCode: string
}) {
  gaEvent("preset_vote_click", {
    page_path: args.pagePath,
    preset_code: args.presetCode,
  })
}
