import type { CustomColours } from "@/lib/custom-colours"
import { customColoursSchema } from "@/lib/custom-colours-schema"
import {
  parsePresetPreviewPageName,
  type PresetPreviewPageName,
} from "@/lib/preset-preview"

/**
 * Customizing a preset keeps everything in the page's address, the same on
 * the preset page and in Ask AI, so a reload, the back button, a shared link
 * and signing in all come back to it as it was. Each page says where the
 * preset code itself lives (its path, or Ask AI's `preset`).
 *
 * - `colours`: custom colours over the preset on show. Only these make it
 *   custom: any listed choice is just another preset.
 * - `view`: the block view the preset is shown in; none for the first.
 * - `customize`: open the Customize panel on arrival (a card's Customize).
 * - `tab`: Customize's tab, `ai` for Ask AI; none for Controls.
 * - `chat`: the conversation in Customize's Ask AI tab, once it has one.
 * - `custom`: an old link's saved preset, by id; it turns into its colours.
 */
const CUSTOM = "custom"
const VIEW = "view"
const COLOURS = "colours"
const CUSTOMIZE = "customize"
const TAB = "tab"
const CHAT = "chat"

export type CustomizeTab = "controls" | "ai"

export type PresetDraft = { code: string; colours: CustomColours }

/** A preset's page with Customize open. */
export function customizePresetPath(code: string) {
  return `/preset/${code}?${CUSTOMIZE}`
}

/** A preset's page with these colours over it. */
export function customColoursPath(code: string, colours: CustomColours) {
  return `/preset/${code}?${withColours(new URLSearchParams(), colours)}`
}

export function readPresetQuery(query: URLSearchParams): {
  /** Custom colours; null when there are none. */
  colours: CustomColours | null
  /** An old link's saved preset, to turn into its colours. */
  custom: string | null
  view: PresetPreviewPageName
  customize: boolean
  tab: CustomizeTab
  chat: string | null
} {
  return {
    colours: parseColours(query.get(COLOURS)),
    custom: query.get(CUSTOM),
    view: parsePresetPreviewPageName(query.get(VIEW)),
    customize: query.has(CUSTOMIZE),
    tab: query.get(TAB) === "ai" ? "ai" : "controls",
    chat: query.get(CHAT),
  }
}

/** The address with these unsaved colours in it, or none. */
export function withColours(
  query: URLSearchParams,
  colours: CustomColours | null
): URLSearchParams {
  const next = new URLSearchParams(query)
  next.delete(COLOURS)
  if (colours) next.set(COLOURS, JSON.stringify(colours))
  return next
}

/** The address with this view, or none for the first. */
export function withView(
  query: URLSearchParams,
  view: PresetPreviewPageName
): URLSearchParams {
  const next = new URLSearchParams(query)
  if (view === "preview") next.delete(VIEW)
  else next.set(VIEW, view)
  return next
}

/** The address with an old link's saved preset turned into its colours. */
export function withSavedColours(
  query: URLSearchParams,
  colours: CustomColours | null
): URLSearchParams {
  const next = withColours(query, colours)
  next.delete(CUSTOM)
  return next
}

/** The address for another preset as it comes, in the same view. */
export function withoutChanges(query: URLSearchParams): URLSearchParams {
  const next = withColours(withoutArrival(query), null)
  next.delete(CUSTOM)
  return next
}

/** The address with nothing about customizing left in it. */
export function withoutCustomizing(query: URLSearchParams): URLSearchParams {
  const next = withoutChanges(query)
  next.delete(VIEW)
  next.delete(TAB)
  next.delete(CHAT)
  return next
}

/** The address with this conversation in it, or none. */
export function withChat(
  query: URLSearchParams,
  chat: string | null
): URLSearchParams {
  const next = new URLSearchParams(query)
  if (chat) next.set(CHAT, chat)
  else next.delete(CHAT)
  return next
}

/** The address with Customize on this tab, or none for Controls. */
export function withCustomizeTab(
  query: URLSearchParams,
  tab: CustomizeTab
): URLSearchParams {
  const next = new URLSearchParams(query)
  if (tab === "ai") next.set(TAB, "ai")
  else next.delete(TAB)
  return next
}

export function withoutArrival(query: URLSearchParams): URLSearchParams {
  const next = new URLSearchParams(query)
  next.delete(CUSTOMIZE)
  return next
}

/** Fired after this page's address changes from here, which `popstate` misses. */
export const ADDRESS_CHANGE_EVENT = "preset-address-change"

/**
 * Changes this page's address in place, as a step history doesn't keep, or
 * (`push`) as one it does. With `null` for its state, so Next takes it as a
 * change to sync into `useSearchParams` (its own state passed back reads as
 * its own write).
 */
export function replaceQuery(
  query: URLSearchParams,
  how: "replace" | "push" = "replace"
) {
  const url = new URL(window.location.href)
  url.search = query.toString()
  if (how === "push") window.history.pushState(null, "", url)
  else window.history.replaceState(null, "", url)
  window.dispatchEvent(new Event(ADDRESS_CHANGE_EVENT))
}

export function hasColours(colours: CustomColours) {
  return Boolean(
    colours.baseColor ||
    colours.theme ||
    colours.chartColor ||
    Object.keys(colours.overrides).length
  )
}

/** Whether two presets would install the same. */
export function samePreset(a: PresetDraft, b: PresetDraft) {
  return a.code === b.code && sameColours(a.colours, b.colours)
}

export function sameColours(a: CustomColours, b: CustomColours) {
  if (
    (a.baseColor ?? "") !== (b.baseColor ?? "") ||
    (a.theme ?? "") !== (b.theme ?? "") ||
    (a.chartColor ?? "") !== (b.chartColor ?? "")
  ) {
    return false
  }
  const keys = new Set([
    ...Object.keys(a.overrides),
    ...Object.keys(b.overrides),
  ]) as Set<keyof CustomColours["overrides"]>
  return [...keys].every((key) => a.overrides[key] === b.overrides[key])
}

/** Colours from the address, or null when there are none to read. */
function parseColours(value: string | null): CustomColours | null {
  if (!value) return null
  try {
    const parsed = customColoursSchema.safeParse(JSON.parse(value))
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}
