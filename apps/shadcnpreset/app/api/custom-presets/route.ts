import { NextResponse } from "next/server"
import { z } from "zod"

import { getSessionUser } from "@/lib/auth"
import { readBrandColours } from "@/lib/brand-theme"
import { customColoursFrom } from "@/lib/custom-colours"
import { customColoursSchema } from "@/lib/custom-colours-schema"
import {
  createCustomPreset,
  customPresetLimitResponse,
  reachedCustomPresetLimit,
} from "@/lib/custom-preset-store"
import { resolvePresetFromCode } from "@/lib/preset"
import { withPartsAskedFor } from "@/lib/search/assistant/custom-preset-request"

const body = z.object({
  presetCode: z.string().trim().min(1).max(32),
  /** The message the colours were given in; the server reads them itself. */
  text: z.string().max(8000).default(""),
  /** Or the colours exactly, as a draft in the editor has them. */
  colours: customColoursSchema.optional(),
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

  const limit = await reachedCustomPresetLimit(user.id)
  if (limit !== null) {
    return NextResponse.json(customPresetLimitResponse(limit), { status: 402 })
  }

  // A draft is saved as it is. From a message, without exact colours it
  // starts as the preset itself, to change bit by bit.
  const { presetCode, colours: custom } = parsed.data.colours
    ? { presetCode: parsed.data.presetCode, colours: parsed.data.colours }
    : await fromMessage(parsed.data.presetCode, parsed.data.text)
  const id = await createCustomPreset({
    userId: user.id,
    presetCode,
    colours: custom,
    chatId: parsed.data.chatId ?? null,
  })
  return NextResponse.json({ id })
}

async function fromMessage(presetCode: string, text: string) {
  const colours = customColoursFrom(readBrandColours(text))
  const read = await withPartsAskedFor({ presetCode, colours, text })
  return { presetCode: read.presetCode, colours }
}
