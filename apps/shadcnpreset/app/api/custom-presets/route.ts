import { NextResponse } from "next/server"
import { z } from "zod"

import { getSessionUser } from "@/lib/auth"
import { readBrandColours } from "@/lib/brand-theme"
import { customColoursFrom } from "@/lib/custom-colours"
import { createCustomPreset } from "@/lib/custom-preset-store"
import { resolvePresetFromCode } from "@/lib/preset"

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

  const id = await createCustomPreset({
    userId: user.id,
    presetCode: parsed.data.presetCode,
    colours: customColoursFrom(colours),
    chatId: parsed.data.chatId ?? null,
  })
  return NextResponse.json({ id })
}
