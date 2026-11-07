import type { CustomColours } from "@/lib/custom-colours"
import { customColoursSchema } from "@/lib/custom-colours-schema"

/**
 * The preset page's address holds everything about customizing, so a reload,
 * the back button, a shared link and signing in all come back to it as it was.
 *
 * - `custom`: a saved custom preset, shown and changed on the page.
 * - `colours`: custom colours not yet saved, over the preset on show. Only
 *   these make a draft: any listed choice is just another preset, with a
 *   page of its own.
 * - `customize`: open the Customize panel on arrival (a card's Customize).
 * - `save`: save on arrival, for the way back from signing in to save.
 */
const CUSTOM = "custom"
const COLOURS = "colours"
const CUSTOMIZE = "customize"
const SAVE = "save"

export type PresetDraft = { code: string; colours: CustomColours }

/** A preset's page with Customize open. */
export function customizePresetPath(code: string) {
  return `/preset/${code}?${CUSTOMIZE}`
}

/** A saved custom preset, on its preset's page. */
export function customPresetPath(id: string, code: string) {
  return `/preset/${code}?${new URLSearchParams({ [CUSTOM]: id })}`
}

export function readPresetQuery(query: URLSearchParams): {
  /** Custom colours not yet saved; null when there are none. */
  colours: CustomColours | null
  /** The saved custom preset on show. */
  custom: string | null
  customize: boolean
  save: boolean
} {
  return {
    colours: parseColours(query.get(COLOURS)),
    custom: query.get(CUSTOM),
    customize: query.has(CUSTOMIZE),
    save: query.has(SAVE),
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

/** The address showing this saved custom preset, with nothing left unsaved. */
export function withSavedPreset(
  query: URLSearchParams,
  id: string
): URLSearchParams {
  const next = withColours(withoutArrival(query), null)
  next.set(CUSTOM, id)
  return next
}

/** The address asking to save once back from signing in. */
export function withSaveOnArrival(query: URLSearchParams): URLSearchParams {
  const next = new URLSearchParams(query)
  next.set(SAVE, "1")
  return next
}

export function withoutArrival(query: URLSearchParams): URLSearchParams {
  const next = new URLSearchParams(query)
  next.delete(CUSTOMIZE)
  next.delete(SAVE)
  return next
}

/**
 * Changes this page's address in place, as a step history doesn't keep.
 * With `null` for its state, so Next takes it as a change to sync into
 * `useSearchParams` (its own state passed back reads as its own write).
 */
export function replaceQuery(query: URLSearchParams) {
  const url = new URL(window.location.href)
  url.search = query.toString()
  window.history.replaceState(null, "", url)
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
