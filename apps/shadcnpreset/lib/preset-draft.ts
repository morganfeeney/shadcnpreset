import { NO_CUSTOM_COLOURS, type CustomColours } from "@/lib/custom-colours"
import { customColoursSchema } from "@/lib/custom-colours-schema"
import { resolvePresetFromCode } from "@/lib/preset"

/**
 * A preset being customized on its page lives in the page's address, so a
 * reload, the back button and signing in all come back to it as it was.
 *
 * - `customize`: open the Customize panel on arrival (from a card's button).
 * - `draft` and `colours`: what has been changed, not yet saved.
 * - `save`: save it on arrival, for the way back from signing in to save.
 */
const CUSTOMIZE = "customize"
const DRAFT = "draft"
const COLOURS = "colours"
const SAVE = "save"

export type PresetDraft = { code: string; colours: CustomColours }

/** A preset's page with Customize open. */
export function customizePresetPath(code: string) {
  return `/preset/${code}?${CUSTOMIZE}`
}

export function readPresetDraft(query: URLSearchParams): {
  draft: PresetDraft | null
  customize: boolean
  save: boolean
} {
  const code = query.get(DRAFT)
  const draft =
    code && resolvePresetFromCode(code)
      ? { code, colours: parseColours(query.get(COLOURS)) }
      : null
  return { draft, customize: query.has(CUSTOMIZE), save: query.has(SAVE) }
}

/** The address with this draft in it, or none, and nothing left to do on arrival. */
export function withPresetDraft(
  query: URLSearchParams,
  draft: PresetDraft | null
): URLSearchParams {
  const next = withoutArrival(query)
  next.delete(DRAFT)
  next.delete(COLOURS)
  if (!draft) return next
  next.set(DRAFT, draft.code)
  if (hasColours(draft.colours)) {
    next.set(COLOURS, JSON.stringify(draft.colours))
  }
  return next
}

/** The address asking to save its draft once back from signing in. */
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

/** Changes this page's address in place, as a step history doesn't keep. */
export function replaceQuery(query: URLSearchParams) {
  const url = new URL(window.location.href)
  url.search = query.toString()
  window.history.replaceState(window.history.state, "", url)
}

/** Colours from the address, or none when they don't read as colours. */
function parseColours(value: string | null): CustomColours {
  if (!value) return NO_CUSTOM_COLOURS
  try {
    const parsed = customColoursSchema.safeParse(JSON.parse(value))
    return parsed.success ? parsed.data : NO_CUSTOM_COLOURS
  } catch {
    return NO_CUSTOM_COLOURS
  }
}

function hasColours(colours: CustomColours) {
  return Boolean(
    colours.baseColor ||
      colours.theme ||
      colours.chartColor ||
      Object.keys(colours.overrides).length
  )
}
