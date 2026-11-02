import { NextResponse } from "next/server"
import { z } from "zod"

import { getSessionUser } from "@/lib/auth"
import { readBrandColours } from "@/lib/brand-theme"
import { customColoursFrom } from "@/lib/custom-colours"
import {
  createCustomPreset,
  customPresetLimitResponse,
  findChatCustomPreset,
  reachedCustomPresetLimit,
} from "@/lib/custom-preset-store"
import { resolvePresetFromCode } from "@/lib/preset"
import { withPartsAskedFor } from "@/lib/search/assistant/custom-preset-request"

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

  // A chat's card reopens the custom preset that chat already made, however
  // it was made (the card, or asking for one) and after a reload.
  const chatId = parsed.data.chatId ?? null
  const made = chatId
    ? await findChatCustomPreset({ userId: user.id, chatId })
    : null
  if (made) return NextResponse.json({ id: made })

  const limit = await reachedCustomPresetLimit(user.id)
  if (limit !== null) {
    return NextResponse.json(customPresetLimitResponse(limit), { status: 402 })
  }

  const colours = readBrandColours(parsed.data.text)
  if (!colours.length) {
    return NextResponse.json(
      { error: "No colours a stylesheet can use were found." },
      { status: 400 }
    )
  }

  const custom = customColoursFrom(colours)
  const { presetCode } = await withPartsAskedFor({
    presetCode: parsed.data.presetCode,
    colours: custom,
    text: parsed.data.text,
  })
  const id = await createCustomPreset({
    userId: user.id,
    presetCode,
    colours: custom,
    chatId,
  })
  return NextResponse.json({ id })
}
