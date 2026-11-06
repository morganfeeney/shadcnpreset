import { openai } from "@ai-sdk/openai"
import { generateText, Output } from "ai"

import type { CustomColours } from "@/lib/custom-colours"
import {
  buildCustomPresetEditPrompt,
  customPresetEditSchema,
  withPresetParts,
} from "@/lib/search/assistant/custom-preset-edit"

/**
 * The preset with any fonts, style, icons or radius the message also asks
 * for ("with Lora, Raleway and #1E3A8A"), which the preset it starts from
 * rarely has. The colours are read from the message exactly, elsewhere.
 * Without an answer, the preset stays as it was: the colours still make it.
 */
export async function withPartsAskedFor({
  presetCode,
  colours,
  text,
}: {
  presetCode: string
  colours: CustomColours
  text: string
}): Promise<{ presetCode: string; changed: string[] }> {
  try {
    const { output } = await generateText({
      model: openai(process.env.OPENAI_ASSISTANT_MODEL ?? "gpt-4o-mini"),
      system: buildCustomPresetEditPrompt(presetCode, colours),
      messages: [{ role: "user", content: text }],
      output: Output.object({
        schema: customPresetEditSchema,
        name: "CustomPresetEdit",
        description:
          "The changes asked for to the open custom preset, every other field null.",
      }),
      temperature: 0.2,
      maxRetries: 0,
    })
    if (output) return withPresetParts(presetCode, output)
  } catch (err) {
    console.error("[custom preset] reading the request", err)
  }
  return { presetCode, changed: [] }
}
