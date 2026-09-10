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
  phase: z.enum(["gathering", "ready", "preview"]),
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
    .describe("Gathering: 1–4 quick replies. Ready/preview: use []."),
  presetVariants: z
    .array(assistantPresetVariantSchema)
    .max(4)
    .describe(
      "Ready: 1–4 full facet tuples + captions. Gathering/preview: use []."
    ),
  previewTitle: z
    .string()
    .max(60)
    .describe(
      "Preview: short tab label (e.g. Date picker). Gathering/ready: use \"\"."
    ),
  previewCode: z
    .string()
    .max(24000)
    .describe(
      "Preview: JSX for function Preview(). Gathering/ready: use \"\"."
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

export type AssistantGeneratedPreview = {
  title: string
  code: string
  /**
   * Preset the preview was generated against, so a chat bubble can re-render it
   * later on a surface that has no live preset of its own. Attached by the route
   * (the model never sees or emits preset codes).
   */
  presetCode?: string
}

export type AssistantPreview = {
  phase: "preview"
  assistantMessage: string
  preview: AssistantGeneratedPreview
}

export type AssistantTurn = AssistantGathering | AssistantReady | AssistantPreview

/** Route encodes `presetVariants` → `AssistantReady.presets` (codes + copy). */
export type NormalizedAssistant =
  | AssistantGathering
  | {
      phase: "ready"
      assistantMessage: string
      presetVariants: AssistantPresetVariantPayload[]
    }
  | AssistantPreview

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

  if (raw.phase === "preview") {
    const title = raw.previewTitle.trim() || "Preview"
    const code = raw.previewCode.trim()
    if (!code) return null
    return {
      phase: "preview",
      assistantMessage: raw.assistantMessage,
      preview: {
        title: title.slice(0, 60),
        code,
      },
    }
  }

  return null
}
