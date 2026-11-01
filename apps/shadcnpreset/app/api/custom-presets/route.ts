import { openai } from "@ai-sdk/openai"
import { generateText, Output } from "ai"
import { NextResponse } from "next/server"
import { z } from "zod"

import { getSessionUser } from "@/lib/auth"
import { readBrandColours } from "@/lib/brand-theme"
import { customColoursFrom, type CustomColours } from "@/lib/custom-colours"
import { createCustomPreset } from "@/lib/custom-preset-store"
import { resolvePresetFromCode } from "@/lib/preset"
import {
  buildCustomPresetEditPrompt,
  customPresetEditSchema,
  withPresetParts,
} from "@/lib/search/assistant/custom-preset-edit"

const body = z.object({
  presetCode: z.string().trim().min(1).max(32),
  /** The message the colours were given in; the server reads them itself. */
  text: z.string().max(8000),
  chatId: z.string().max(64).nullish(),
})

export async function POST(request: Request) {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json(
      { error: "Sign in to make a custom preset." },
      { status: 401 }
    )
  }

  const parsed = body.safeParse(await request.json().catch(() => null))
  if (!parsed.success || !resolvePresetFromCode(parsed.data.presetCode)) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  }

  const colours = readBrandColours(parsed.data.text)
  if (!colours.length) {
    return NextResponse.json(
      { error: "No colours a stylesheet can use were found." },
      { status: 400 }
    )
  }

  const custom = customColoursFrom(colours)
  const id = await createCustomPreset({
    userId: user.id,
    presetCode: await withPartsAskedFor(
      parsed.data.presetCode,
      custom,
      parsed.data.text
    ),
    colours: custom,
    chatId: parsed.data.chatId ?? null,
  })
  return NextResponse.json({ id })
}

/**
 * The preset with any fonts, style, icons or radius the message also asks
 * for ("with Lora, Raleway and #1E3A8A"), which the preset the colours were
 * offered on rarely has. Without an answer, the colours still make it.
 */
async function withPartsAskedFor(
  presetCode: string,
  colours: CustomColours,
  text: string
) {
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
    return output ? withPresetParts(presetCode, output) : presetCode
  } catch (err) {
    console.error("[api/custom-presets] reading the request", err)
    return presetCode
  }
}
