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

type AiAssistantIntent =
  | "preset_discovery"
  | "preset_refinement"
  | "troubleshooting"
  | "other"

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

export function trackAiAssistantOpen(args: { pagePath: string }) {
  gaEvent("ai_assistant_open", {
    page_path: args.pagePath,
  })
}

export function trackAiAssistantPromptSubmit(args: {
  pagePath: string
  /** Trimmed user message; GA may truncate per its limits. */
  promptText: string
  promptLength: number
  intent?: AiAssistantIntent
}) {
  gaEvent("ai_assistant_prompt_submit", {
    page_path: args.pagePath,
    assistant_prompt: args.promptText,
    prompt_length: args.promptLength,
    ...(args.intent ? { intent: args.intent } : {}),
  })
}

export function trackAiAssistantResponseSuccess(args: {
  pagePath: string
  latencyMs: number
}) {
  gaEvent("ai_assistant_response_success", {
    page_path: args.pagePath,
    latency_ms: args.latencyMs,
  })
}

export function trackAiAssistantResponseError(args: {
  pagePath: string
  latencyMs?: number
  errorType: string
}) {
  gaEvent("ai_assistant_response_error", {
    page_path: args.pagePath,
    ...(typeof args.latencyMs === "number" ? { latency_ms: args.latencyMs } : {}),
    error_type: args.errorType,
  })
}

export function trackAiAssistantResultClick(args: {
  pagePath: string
  resultType: "preset" | "link" | "action"
  targetId?: string
}) {
  gaEvent("ai_assistant_result_click", {
    page_path: args.pagePath,
    result_type: args.resultType,
    ...(args.targetId ? { target_id: args.targetId } : {}),
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

export function trackPresetThemeDecodeSubmit(args: {
  pagePath: string
  presetCode: string
}) {
  gaEvent("preset_theme_decode_submit", {
    page_path: args.pagePath,
    preset_code: args.presetCode,
  })
}
