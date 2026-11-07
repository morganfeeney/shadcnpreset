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
- baseColor: the neutrals (background, text, borders). List: ${list(PRESET_FILTER_OPTIONS.baseColors)}. An exact colour tints the greys with its hue.
- chartColor: the chart shades. List: ${list(PRESET_FILTER_OPTIONS.themes)}.
Use a list name when the words match one ("make it green" → theme "green"). Use an exact CSS colour (hex or oklch) when they give one, or when no list name is close ("forest green", "brand navy").

Other parts take list values only: style (${list(PRESET_FILTER_OPTIONS.styles)}), font and fontHeading (${list(PRESET_FILTER_OPTIONS.fonts)}; fontHeading may be "inherit"), iconLibrary (${list(PRESET_FILTER_OPTIONS.iconLibraries)}), radius (${list(PRESET_FILTER_OPTIONS.radii)}). Lyra is always square.

Overrides set one token to an exact colour (${list(BRAND_TOKENS)}). Use them only when the person names a specific part, like "make the background #101418". Use removeOverrides to drop one.

assistantMessage: say plainly what you changed, in one or two sentences, naming things as the pickers show them ("Inter", "Green", "Large", not "inter"). If the request is unclear, change nothing and ask.

Only the fields above can change. Shadows, spacing, padding, borders, sizes and any other CSS can't: for those, change nothing and say so plainly, without asking for details.`
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
): { presetCode: string; colours: CustomColours; changed: string[] } {
  let presetCode = current.presetCode
  const colours: CustomColours = {
    ...current.colours,
    overrides: { ...current.colours.overrides },
  }
  const changed: string[] = []

  for (const { key, label } of CUSTOM_PRESET_COLOUR_FACETS) {
    const value = edit[key] ? asWritten(edit[key]) : undefined
    if (!value) continue
    const name = value.toLowerCase()
    if (COLOUR_LISTS[key].includes(name)) {
      const next = withFacet(presetCode, key, name)
      if (!next) continue
      presetCode = next
      delete colours[key]
      changed.push(`${label}: ${facetValueLabel(key, name)}`)
    } else if (isUsableColour(value)) {
      colours[key] = value
      changed.push(`${label}: ${value}`)
    }
  }

  for (const key of FACET_KEYS) {
    const value = edit[key as keyof CustomPresetEdit]
    if (typeof value !== "string") continue
    const next = withFacet(presetCode, key as CustomPresetFacet, value)
    if (!next || next === presetCode) continue
    presetCode = next
    const label = CUSTOM_PRESET_FACETS.find((facet) => facet.key === key)?.label
    changed.push(
      `${label}: ${facetValueLabel(key as CustomPresetFacet, value)}`
    )
  }

  for (const { token, colour: given } of edit.overrides) {
    const colour = asWritten(given)
    if (!isUsableColour(colour)) continue
    colours.overrides[token as BrandToken] = colour
    changed.push(`${token}: ${colour}`)
  }
  for (const token of edit.removeOverrides) {
    if (colours.overrides[token as BrandToken]) {
      delete colours.overrides[token as BrandToken]
      changed.push(`${token}: removed`)
    }
  }

  return { presetCode, colours, changed }
}

function escapeRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

/**
 * The edit with any colour its own reply names filled in. Models write "Changed
 * the Chart Color to #00BDDF" and leave `chartColor` empty often enough that
 * the change would be lost; the value is taken only when the person's message
 * holds it too, so nothing is made up.
 */
export function fillNamedColours(
  edit: CustomPresetEdit,
  message: string
): CustomPresetEdit {
  const filled = { ...edit }
  const asked = message.toLowerCase()
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
export function editReply(changed: string[], edit: CustomPresetEdit): string {
  if (changed.length) {
    const parts = changed.map(describeChange)
    const listed =
      parts.length === 1
        ? parts[0]
        : `${parts.slice(0, -1).join(", ")} and ${parts.at(-1)}`
    const sentence = listed.startsWith("removed") ? listed : `changed ${listed}`
    return `${sentence.charAt(0).toUpperCase()}${sentence.slice(1)}.`
  }
  // Nothing changed, so anything but a question back would be a claim.
  const message = tidyEditReply(edit.assistantMessage, edit)
  return message.trim().endsWith("?") ? message : NOTHING_CHANGED
}

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
