import { formatHex, parse } from "culori"
import { z } from "zod"

import {
  BRAND_TOKENS,
  isUsableColour,
  type BrandToken,
} from "@/lib/brand-theme"
import type { CustomColours, CustomSlot } from "@/lib/custom-colours"
import {
  CUSTOM_PRESET_COLOUR_FACETS,
  CUSTOM_PRESET_FACETS,
  facetValueLabel,
  withFacet,
  type CustomPresetFacet,
} from "@/lib/custom-preset"
import { resolvePresetFromCode } from "@/lib/preset"
import { PRESET_FILTER_OPTIONS } from "@/lib/preset-catalog"

const enumOf = (values: readonly string[]) =>
  z.enum(values as [string, ...string[]])

/**
 * What the assistant sends back while a custom preset is open: the changes
 * someone asked for, each null when they did not ask for it. Every field is
 * present (nullable rather than optional) for the model's structured output.
 */
export const customPresetEditSchema = z.object({
  assistantMessage: z
    .string()
    .describe(
      "One or two short sentences saying what changed, or what you need to know."
    ),
  style: enumOf(PRESET_FILTER_OPTIONS.styles).nullable(),
  font: enumOf(PRESET_FILTER_OPTIONS.fonts).nullable(),
  fontHeading: enumOf(PRESET_FILTER_OPTIONS.fontHeadings).nullable(),
  iconLibrary: enumOf(PRESET_FILTER_OPTIONS.iconLibraries).nullable(),
  radius: enumOf(PRESET_FILTER_OPTIONS.radii).nullable(),
  baseColor: z
    .string()
    .nullable()
    .describe("A Base Color name from the list, or one exact CSS colour."),
  theme: z
    .string()
    .nullable()
    .describe("A Theme name from the list, or one exact CSS colour."),
  chartColor: z
    .string()
    .nullable()
    .describe("A Chart Color name from the list, or one exact CSS colour."),
  overrides: z
    .array(z.object({ token: z.enum(BRAND_TOKENS), colour: z.string() }))
    .describe("Single tokens to set exactly, only when asked for one."),
  removeOverrides: z.array(z.enum(BRAND_TOKENS)),
  notChanged: z
    .array(z.string())
    .describe(
      "Parts asked for that none of the fields above can hold, as the person named them."
    ),
})

export type CustomPresetEdit = z.infer<typeof customPresetEditSchema>

const COLOUR_LISTS: Record<CustomSlot, readonly string[]> = {
  baseColor: PRESET_FILTER_OPTIONS.baseColors,
  theme: PRESET_FILTER_OPTIONS.themes,
  chartColor: PRESET_FILTER_OPTIONS.themes,
}

const FACET_KEYS = CUSTOM_PRESET_FACETS.map(({ key }) => key)

function describe(presetCode: string, colours: CustomColours) {
  const preset = resolvePresetFromCode(presetCode)
  if (!preset) return ""
  const lines = CUSTOM_PRESET_COLOUR_FACETS.map(({ key, label }) => {
    const custom = colours[key]
    const listValue =
      key === "chartColor" ? preset.effectiveChartColor : preset[key]
    return `- ${label}: ${custom ? `custom ${custom}` : listValue}`
  })
  for (const { key, label } of CUSTOM_PRESET_FACETS) {
    lines.push(`- ${label}: ${preset[key]}`)
  }
  const overrides = Object.entries(colours.overrides)
  lines.push(
    `- Overrides: ${
      overrides.length
        ? overrides.map(([token, colour]) => `${token} ${colour}`).join(", ")
        : "none"
    }`
  )
  return lines.join("\n")
}

/** The system prompt for a chat whose custom preset is open beside it. */
export function buildCustomPresetEditPrompt(
  presetCode: string,
  colours: CustomColours
) {
  const list = (values: readonly string[]) => values.join(", ")
  return `You are editing one custom shadcn preset that is open beside this chat. Every message is a change to it, or a question about it. Do not suggest other presets.

The preset now:
${describe(presetCode, colours)}

Return only what the person asked to change; leave every other field null and the lists empty.

Colours work like shadcn create's three pickers, each a list name or one exact colour:
- theme: the primary and accent colour. List: ${list(PRESET_FILTER_OPTIONS.themes)}.
- baseColor: the neutrals (background, text, borders). List: ${list(PRESET_FILTER_OPTIONS.baseColors)}. An exact colour tints the greys with its hue. Change it only when they ask about the neutrals, background or greys, or describe the whole palette ("warm", "earthy"): "make it teal" is the theme alone.
- chartColor: the chart shades. List: ${list(PRESET_FILTER_OPTIONS.themes)}.
Use a list name when the words match one ("make it green" → theme "green"). Use an exact colour when they give one, or when no list name is close ("forest green", "brand navy"): hex or oklch, never a colour word like "brown". For a mood or a kind of business, choose fitting exact colours yourself.

Other parts take list values only: style (${list(PRESET_FILTER_OPTIONS.styles)}), font and fontHeading (${list(PRESET_FILTER_OPTIONS.fonts)}; fontHeading may be "inherit"), iconLibrary (${list(PRESET_FILTER_OPTIONS.iconLibraries)}), radius (${list(PRESET_FILTER_OPTIONS.radii)}). Lyra is always square.

Overrides set one token to an exact colour (${list(BRAND_TOKENS)}). Use them only when the person names a specific part, like "make the background #101418". Use removeOverrides to drop one. Never put a colour given for one part onto a different part: an input, popover or sidebar colour is not an accent or anything else here.

assistantMessage: say plainly what you changed, in one or two sentences, naming things as the pickers show them ("Inter", "Green", "Large", not "inter"). If the request is unclear, change nothing and ask.

Make every change the message asks for that the fields above can hold, even when it asks for other things too. Shadows, spacing, padding, sizes, other tokens and any other CSS can't change: list those in notChanged, as they were named, and make the rest of the changes. notChanged holds only what this message asked for, and is empty when it asked for nothing they can't hold.`
}

/**
 * A colour as the model gave it, less the "custom" it copies from how the
 * prompt describes the preset ("Chart Color: custom #22C55E").
 */
function asWritten(colour: string) {
  return colour.trim().replace(/^custom\s+/i, "")
}

/**
 * The open custom preset with an edit applied. Values the preset cannot take
 * are skipped rather than guessed at; what did change is named, for the reply
 * and for analytics.
 */
export function applyCustomPresetEdit(
  current: { presetCode: string; colours: CustomColours },
  edit: CustomPresetEdit
): {
  presetCode: string
  colours: CustomColours
  changed: string[]
  /** Something asked for is how the preset is already. */
  already: boolean
} {
  let presetCode = current.presetCode
  const colours: CustomColours = {
    ...current.colours,
    overrides: { ...current.colours.overrides },
  }
  const changed: string[] = []
  let already = false

  for (const { key, label } of CUSTOM_PRESET_COLOUR_FACETS) {
    const value = edit[key] ? asWritten(edit[key]) : undefined
    if (!value) continue
    const name = value.toLowerCase()
    if (COLOUR_LISTS[key].includes(name)) {
      const next = withFacet(presetCode, key, name)
      if (!next) continue
      if (next === presetCode && !colours[key]) {
        already = true
        continue
      }
      presetCode = next
      delete colours[key]
      changed.push(`${label}: ${facetValueLabel(key, name)}`)
    } else if (isUsableColour(value)) {
      const colour = exact(value)
      if (sameColour(colours[key], colour)) {
        already = true
        continue
      }
      colours[key] = colour
      changed.push(`${label}: ${colour}`)
    }
  }

  for (const key of FACET_KEYS) {
    const value = edit[key as keyof CustomPresetEdit]
    if (typeof value !== "string") continue
    const next = withFacet(presetCode, key as CustomPresetFacet, value)
    if (!next) continue
    if (next === presetCode) {
      already = true
      continue
    }
    presetCode = next
    const label = CUSTOM_PRESET_FACETS.find((facet) => facet.key === key)?.label
    changed.push(
      `${label}: ${facetValueLabel(key as CustomPresetFacet, value)}`
    )
  }

  for (const { token, colour: given } of edit.overrides) {
    const written = asWritten(given)
    if (!isUsableColour(written)) continue
    const colour = exact(written)
    if (sameColour(colours.overrides[token as BrandToken], colour)) {
      already = true
      continue
    }
    colours.overrides[token as BrandToken] = colour
    changed.push(`${token}: ${colour}`)
  }
  for (const token of edit.removeOverrides) {
    if (colours.overrides[token as BrandToken]) {
      delete colours.overrides[token as BrandToken]
      changed.push(`${token}: removed`)
    }
  }

  return { presetCode, colours, changed, already }
}

/**
 * A colour word ("brown", "white") as its hex; any other colour as given. One
 * with see-through in it ("transparent") stays a word, which hex would lose.
 */
function exact(colour: string) {
  if (!/^[a-z]+$/i.test(colour)) return colour
  const parsed = parse(colour)
  if (!parsed || (parsed.alpha ?? 1) < 1) return colour
  return formatHex(parsed) ?? colour
}

function sameColour(a: string | undefined, b: string) {
  return a !== undefined && a.trim().toLowerCase() === b.trim().toLowerCase()
}

/** Parts of a theme a custom preset has no place for. */
const CANNOT_HOLD =
  /shadow|spacing|padding|margin|gap|size|width|height|animation|motion|transition|tracking|letter|leading|line|blur|opacity|gradient|destructive|ring|sidebar|popover|input/i

function escapeRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

/**
 * The edit with any colour its own reply names filled in, and only what was
 * asked for named as not changed. Models write "Changed
 * the Chart Color to #00BDDF" and leave `chartColor` empty often enough that
 * the change would be lost; the value is taken only when the person's message
 * holds it too, so nothing is made up.
 */
export function fillNamedColours(
  edit: CustomPresetEdit,
  message: string
): CustomPresetEdit {
  const asked = message.toLowerCase()
  // What it says couldn't change is only something they asked for that a
  // preset has no place for: the model also lists what it did change ("sharp
  // corners"), the preset's own values ("lucide") or every limit there is.
  const filled = {
    ...edit,
    notChanged: edit.notChanged.filter(
      (part) =>
        CANNOT_HOLD.test(part) &&
        part
          .toLowerCase()
          .split(/[^a-z]+/)
          .some((word) => word.length > 3 && asked.includes(word))
    ),
  }
  for (const { key, label } of CUSTOM_PRESET_COLOUR_FACETS) {
    if (filled[key]) continue
    // A colour function, a hex, or a list name, as the reply wrote it.
    const named = new RegExp(
      `${escapeRegExp(label)}\\s+to\\s+(?:custom\\s+)?([a-z]+\\([^)]*\\)|#[0-9a-f]{3,8}|[a-z-]+)`,
      "i"
    ).exec(edit.assistantMessage)
    const value = named?.[1]
    if (!value || !asked.includes(value.toLowerCase())) continue
    const name = value.toLowerCase()
    if (COLOUR_LISTS[key].includes(name) || isUsableColour(value)) {
      filled[key] = value
    }
  }
  return filled
}

/** "Theme: Green" as "the Theme to Green", for a reply. */
function describeChange(change: string) {
  const [part, value] = change.split(": ")
  if (value === "removed") return `removed the ${part} override`
  return `the ${part} to ${value}`
}

/**
 * The reply to an edit, said from what actually changed rather than from the
 * model, which can claim a change it did not make ("Added a red shadow to
 * the cards"). With nothing changed, its words stand only as a question.
 */
export function editReply(
  changed: string[],
  edit: CustomPresetEdit,
  already = false
): string {
  if (changed.length) {
    const parts = changed.map(describeChange)
    const listed =
      parts.length === 1
        ? parts[0]
        : `${parts.slice(0, -1).join(", ")} and ${parts.at(-1)}`
    const sentence = listed.startsWith("removed") ? listed : `changed ${listed}`
    const reply = `${sentence.charAt(0).toUpperCase()}${sentence.slice(1)}.`
    const missed = edit.notChanged
    if (!missed.length) return reply
    const named =
      missed.length === 1
        ? missed[0]
        : `${missed.slice(0, -1).join(", ")} or ${missed.at(-1)}`
    return `${reply} A custom preset can’t change ${named}.`
  }
  // Nothing changed, so anything but a question back would be a claim.
  const message = tidyEditReply(edit.assistantMessage, edit)
  if (message.trim().endsWith("?")) return message
  return already ? ALREADY : NOTHING_CHANGED
}

const ALREADY = "The preset is like that already."

const NOTHING_CHANGED =
  "That isn’t something a custom preset can change. It takes colours (Base, Theme, Chart and single overrides), style, fonts, icons and radius."

/**
 * The reply with any value it changed named as the pickers show it: models
 * echo raw values ("'lora'", "neutral") however they are asked not to.
 */
export function tidyEditReply(message: string, edit: CustomPresetEdit) {
  let tidy = message
  const facets = [...CUSTOM_PRESET_FACETS, ...CUSTOM_PRESET_COLOUR_FACETS]
  for (const { key } of facets) {
    const value = edit[key as keyof CustomPresetEdit]
    if (typeof value !== "string" || !/^[a-z0-9-]+$/.test(value)) continue
    const label = facetValueLabel(key as CustomPresetFacet, value)
    const raw = value.replace(/-/g, "\\-")
    tidy = tidy.replace(new RegExp(`['"\`]?\\b${raw}\\b['"\`]?`, "g"), label)
  }
  return tidy
}
