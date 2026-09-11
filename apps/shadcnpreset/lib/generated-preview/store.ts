import type { GeneratedPreviewPayload } from "@/lib/generated-preview/messages"

export const GENERATED_PREVIEW_STORAGE_KEY = "shadcnpreset:generated-preview"

/**
 * Session-scoped store for the preview the assistant last generated.
 *
 * Read through `useSyncExternalStore` rather than during render: the value only
 * exists on the client, so the server snapshot is always `null` and React can
 * hydrate against matching markup before swapping in the stored preview.
 */
let cache: GeneratedPreviewPayload | null = null
let cacheLoaded = false
const listeners = new Set<() => void>()

function isPayload(value: unknown): value is GeneratedPreviewPayload {
  if (!value || typeof value !== "object") return false
  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.title === "string" &&
    candidate.title.trim().length > 0 &&
    typeof candidate.code === "string" &&
    candidate.code.trim().length > 0
  )
}

function readFromSession(): GeneratedPreviewPayload | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.sessionStorage.getItem(GENERATED_PREVIEW_STORAGE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    return isPayload(parsed) ? { title: parsed.title, code: parsed.code } : null
  } catch {
    return null
  }
}

function writeToSession(payload: GeneratedPreviewPayload | null) {
  if (typeof window === "undefined") return
  try {
    if (!payload) {
      window.sessionStorage.removeItem(GENERATED_PREVIEW_STORAGE_KEY)
      return
    }
    window.sessionStorage.setItem(
      GENERATED_PREVIEW_STORAGE_KEY,
      JSON.stringify(payload)
    )
  } catch {
    // Ignore quota / private-mode failures — the in-memory value still applies.
  }
}

export function subscribeToGeneratedPreview(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** Stable reference per stored value, as `useSyncExternalStore` requires. */
export function getGeneratedPreviewSnapshot(): GeneratedPreviewPayload | null {
  if (!cacheLoaded) {
    cache = readFromSession()
    cacheLoaded = true
  }
  return cache
}

export function getGeneratedPreviewServerSnapshot(): GeneratedPreviewPayload | null {
  return null
}

export function setStoredGeneratedPreview(
  payload: GeneratedPreviewPayload | null
) {
  const current = getGeneratedPreviewSnapshot()
  if (current?.title === payload?.title && current?.code === payload?.code) {
    return
  }
  cache = payload ? { title: payload.title, code: payload.code } : null
  cacheLoaded = true
  writeToSession(cache)
  for (const listener of listeners) {
    listener()
  }
}

/** Test-only: drops the in-memory cache so the next read hits sessionStorage. */
export function resetGeneratedPreviewStoreForTests() {
  cache = null
  cacheLoaded = false
  listeners.clear()
}
