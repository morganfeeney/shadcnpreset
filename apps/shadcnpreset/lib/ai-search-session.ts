import { decodeSearchQuerySegment } from "@/lib/search-route"

const STORAGE_KEY = "shadcnpreset_ai_search_context"

export type AiSearchSessionPayload = {
  optimizedQuery: string
  userMessages: string[]
  savedAt: number
}

function normalizeSmartQuery(q: string): string {
  return decodeSearchQuerySegment(q).trim().toLowerCase().replace(/\s+/g, " ")
}

export function persistAiSearchContext(args: {
  optimizedQuery: string
  userMessages: string[]
}): void {
  if (typeof window === "undefined") return
  const payload: AiSearchSessionPayload = {
    optimizedQuery: args.optimizedQuery.trim(),
    userMessages: args.userMessages.filter((s) => s.trim().length > 0),
    savedAt: Date.now(),
  }
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

/** When the URL query matches the last AI-optimized query, return the user wording for display. */
export function readAiSearchContextForRoute(
  routeQuerySegment: string
): { userSummary: string } | null {
  if (typeof window === "undefined") return null
  const raw = sessionStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    const data = JSON.parse(raw) as AiSearchSessionPayload
    const cur = normalizeSmartQuery(routeQuerySegment)
    const opt = normalizeSmartQuery(data.optimizedQuery)
    if (cur !== opt) return null
    const userSummary = data.userMessages.join(" — ")
    if (!userSummary) return null
    return { userSummary }
  } catch {
    return null
  }
}

export function clearAiSearchContext(): void {
  if (typeof window === "undefined") return
  sessionStorage.removeItem(STORAGE_KEY)
}
