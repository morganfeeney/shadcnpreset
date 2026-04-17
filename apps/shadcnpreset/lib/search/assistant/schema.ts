import { z } from "zod"
import {
  PRESET_FONTS,
  PRESET_FONT_HEADINGS,
  PRESET_ICON_LIBRARIES,
  PRESET_MENU_ACCENTS,
  PRESET_MENU_COLORS,
  PRESET_RADII,
  PRESET_STYLES,
} from "shadcn/preset"

import { PRESET_FILTER_OPTIONS } from "@/lib/preset-catalog"

/** OpenAI structured output: every property must appear in `required` — use enums, not `.optional()`. */
function asEnum<const T extends readonly string[]>(xs: T) {
  return xs as unknown as [string, ...string[]]
}

/**
 * Full facet tuple matching `PresetConfig` (all keys required for the API JSON schema).
 */
export const assistantPresetConfigSchema = z.object({
  style: z.enum(asEnum(PRESET_STYLES)),
  /** Aligned with v4 preview + gallery — excludes \`gray\` base and invalid theme keys. */
  baseColor: z.enum(asEnum(PRESET_FILTER_OPTIONS.baseColors)),
  theme: z.enum(asEnum(PRESET_FILTER_OPTIONS.themes)),
  chartColor: z.enum(asEnum(PRESET_FILTER_OPTIONS.chartColors)),
  iconLibrary: z.enum(asEnum(PRESET_ICON_LIBRARIES)),
  font: z.enum(asEnum(PRESET_FONTS)),
  fontHeading: z.enum(asEnum(PRESET_FONT_HEADINGS)),
  radius: z.enum(asEnum(PRESET_RADII)),
  menuAccent: z.enum(asEnum(PRESET_MENU_ACCENTS)),
  menuColor: z.enum(asEnum(PRESET_MENU_COLORS)),
})

export const assistantPresetVariantSchema = assistantPresetConfigSchema.extend({
  caption: z
    .string()
    .max(160)
    .describe(
      "Very short card title for this variant (e.g. Dark fintech — dense)."
    ),
})

export type AssistantPresetVariantPayload = z.infer<
  typeof assistantPresetVariantSchema
>

export const assistantTurnOutputSchema = z.object({
  phase: z.enum(["gathering", "ready"]),
  assistantMessage: z.string().max(8000),
  followUpQuestions: z
    .array(
      z
        .string()
        .max(160)
        .describe(
          "Tap-to-send quick reply: a short statement or label, not a question."
        )
    )
    .max(4)
    .describe("Gathering: 1–4 quick replies. Ready: use []."),
  presetVariants: z
    .array(assistantPresetVariantSchema)
    .max(4)
    .describe(
      "Ready: 1–4 full facet tuples + captions. Gathering: use []."
    ),
})

export type AssistantTurnOutput = z.infer<typeof assistantTurnOutputSchema>

export type AssistantGathering = {
  phase: "gathering"
  assistantMessage: string
  followUpQuestions: string[]
}

export type AssistantReadyPreset = {
  code: string
  caption: string
  description: string
}

export type AssistantReady = {
  phase: "ready"
  assistantMessage: string
  presets: AssistantReadyPreset[]
}

export type AssistantTurn = AssistantGathering | AssistantReady

/** Route encodes `presetVariants` → `AssistantReady.presets` (codes + copy). */
export type NormalizedAssistant =
  | AssistantGathering
  | {
      phase: "ready"
      assistantMessage: string
      presetVariants: AssistantPresetVariantPayload[]
    }

export function normalizeAssistantTurn(raw: AssistantTurnOutput): NormalizedAssistant | null {
  if (raw.phase === "gathering") {
    const qs = raw.followUpQuestions.filter((q) => q.trim().length > 0)
    if (qs.length < 1) return null
    if (raw.presetVariants.length !== 0) return null
    return {
      phase: "gathering",
      assistantMessage: raw.assistantMessage,
      followUpQuestions: qs.slice(0, 4),
    }
  }

  if (raw.phase === "ready") {
    const n = raw.presetVariants.length
    if (n < 1 || n > 4) return null
    if (raw.followUpQuestions.some((q) => q.trim().length > 0)) return null
    return {
      phase: "ready",
      assistantMessage: raw.assistantMessage,
      presetVariants: raw.presetVariants,
    }
  }

  return null
}
