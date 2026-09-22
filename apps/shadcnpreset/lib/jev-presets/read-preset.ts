import {
  DEFAULT_PRESET_CONFIG,
  encodePreset,
  type PresetConfig,
} from "shadcn/preset"

import { clampPresetConfigForV4Preview } from "@/lib/preset-catalog"
import { JEV_PRESET_FIELDS, UNSPECIFIED } from "@/lib/jev-presets/fields"

export type JevChoiceAnswer = {
  probabilities: Record<string, number>
}

export type JevFieldReading = {
  field: keyof PresetConfig
  label: string
  value: string
  /** Share of the probability Jev gave the real options, so 0–1 among them. */
  probability: number
  /** The description asked for this field, rather than Jev filling it in. */
  stated: boolean
}

export type JevPresetReading = {
  code: string
  config: PresetConfig
  fields: JevFieldReading[]
}

/** A field counts as asked for once Jev puts less than even odds on "unspecified". */
const STATED_BELOW_UNSPECIFIED = 0.5

/** Grey accents: "monochrome", rather than a colour of their own. */
const MONOCHROME_ACCENTS = new Set(["neutral", "stone", "zinc", "gray"])

function monochromeToNeutrals(
  value: string,
  baseColor: PresetConfig["baseColor"]
): string {
  return MONOCHROME_ACCENTS.has(value) ? baseColor : value
}

/**
 * The corners some styles actually render.
 *
 * The v4 preview overrides these itself, so without the same rule here the
 * reading panel promises corners the preview will not show.
 */
function withStyleRadius(config: PresetConfig): PresetConfig {
  if (config.style === "lyra" || config.style === "sera") {
    return { ...config, radius: "none" }
  }
  if (config.style === "rhea" && config.radius === "large") {
    return { ...config, radius: "default" }
  }
  return config
}

/** Everything the preview will do to a config before it renders it. */
function normalizeForPreview(config: PresetConfig): PresetConfig {
  return clampPresetConfigForV4Preview(withStyleRadius(config))
}

/**
 * Turns one System One response into the single preset it describes.
 *
 * Every field takes Jev's most likely value — stated or inferred — except where
 * that value cannot pair with fields already chosen (an accent the neutral tone
 * does not allow). Then the next most likely value that the preview accepts
 * wins, so the catalog's own clamp stays the one definition of "allowed".
 */
export function readPresetFromJev(
  answers: Record<string, JevChoiceAnswer | undefined>
): JevPresetReading | null {
  let config: PresetConfig = { ...DEFAULT_PRESET_CONFIG }
  const fields: JevFieldReading[] = []

  for (const spec of JEV_PRESET_FIELDS) {
    const probabilities = answers[spec.field]?.probabilities
    // Only a missing answer is a broken response. A field Jev has nothing to
    // say about is ordinary, and keeps the preset default below.
    if (!probabilities) return null

    const ranked = Object.entries(probabilities)
      .filter(([value]) => value !== UNSPECIFIED && value in spec.options)
      .map(([value, p]): [string, number] => [
        // "Monochrome" only reads as a grey the neutrals allow: their own tone.
        // Left alone it fails the check below and hands the accent to whatever
        // colour happened to come next.
        spec.field === "theme" || spec.field === "chartColor"
          ? monochromeToNeutrals(value, config.baseColor)
          : value,
        p,
      ])
      .sort((a, b) => b[1] - a[1])
    const total = ranked.reduce((sum, [, p]) => sum + p, 0)

    const accepted = ranked.find(([value]) => {
      const candidate = { ...config, [spec.field]: value } as PresetConfig
      return normalizeForPreview(candidate)[spec.field] === value
    })

    // Nothing Jev offered fits, or it had nothing to offer: fall back to the
    // preset default, put through the same rules so the panel reports the
    // value the preview will render (Lyra's corners are always sharp).
    const [value, p] = accepted ?? [
      normalizeForPreview({
        ...config,
        [spec.field]: DEFAULT_PRESET_CONFIG[spec.field],
      })[spec.field],
      0,
    ]

    config = { ...config, [spec.field]: value } as PresetConfig
    fields.push({
      field: spec.field,
      label: spec.label,
      value: String(value),
      probability: total > 0 ? p / total : 0,
      stated: (probabilities[UNSPECIFIED] ?? 0) < STATED_BELOW_UNSPECIFIED,
    })
  }

  // A heading font that matches the body is the same preset as "inherit".
  if (config.fontHeading === config.font) {
    config = { ...config, fontHeading: "inherit" }
  }
  config = normalizeForPreview(config)

  return { code: encodePreset(config), config, fields }
}
