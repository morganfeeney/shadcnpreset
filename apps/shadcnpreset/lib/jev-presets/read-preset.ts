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
    if (!probabilities) return null

    const ranked = Object.entries(probabilities)
      .filter(([value]) => value !== UNSPECIFIED && value in spec.options)
      .sort((a, b) => b[1] - a[1])
    const total = ranked.reduce((sum, [, p]) => sum + p, 0)
    if (!ranked.length || total <= 0) return null

    const accepted = ranked.find(([value]) => {
      const candidate = { ...config, [spec.field]: value } as PresetConfig
      return clampPresetConfigForV4Preview(candidate)[spec.field] === value
    })
    if (!accepted) return null

    const [value, p] = accepted
    config = { ...config, [spec.field]: value } as PresetConfig
    fields.push({
      field: spec.field,
      label: spec.label,
      value,
      probability: p / total,
      stated: (probabilities[UNSPECIFIED] ?? 0) < STATED_BELOW_UNSPECIFIED,
    })
  }

  // A heading font that matches the body is the same preset as "inherit".
  if (config.fontHeading === config.font) {
    config = { ...config, fontHeading: "inherit" }
  }
  config = clampPresetConfigForV4Preview(config)

  return { code: encodePreset(config), config, fields }
}
