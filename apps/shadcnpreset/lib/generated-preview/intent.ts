const SHOW_VERBS = /\b(show|display|render|preview|put|open)\b/
const UI_NOUNS =
  /\b(component|components|block|blocks|picker|calendar|button|dialog|form|table|sidebar|login|dashboard|card|select|input|chart|menu|sheet|drawer|date|accordion|tabs|avatar|badge|alert)\b/

/**
 * Best-effort guess at whether a prompt is asking for a component demo, used
 * only to label the pending shimmer. The model decides the actual phase.
 */
export function looksLikePreviewRequest(text: string): boolean {
  const t = text.toLowerCase()
  return SHOW_VERBS.test(t) && UI_NOUNS.test(t)
}
