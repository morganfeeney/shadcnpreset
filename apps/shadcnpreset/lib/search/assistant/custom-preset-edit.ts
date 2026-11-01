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

assistantMessage: say plainly what you changed, in one or two sentences, naming things as the pickers show them ("Inter", "Green", "Large", not "inter"). If the request is unclear, change nothing and ask.`
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
    const value = edit[key]?.trim()
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

  for (const { token, colour } of edit.overrides) {
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

/**
 * `presetCode` with the style, fonts, icons and radius from an edit, for a
 * custom preset being made: its colours come from the message itself, read
 * exactly, so the edit's colours are left out.
 */
export function withPresetParts(presetCode: string, edit: CustomPresetEdit) {
  return applyCustomPresetEdit(
    { presetCode, colours: { overrides: {} } },
    {
      ...edit,
      baseColor: null,
      theme: null,
      chartColor: null,
      overrides: [],
      removeOverrides: [],
    }
  ).presetCode
}

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
