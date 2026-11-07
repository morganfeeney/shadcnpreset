import { NextResponse } from "next/server"
import { z } from "zod"

import { getSessionUser } from "@/lib/auth"
import { customColoursSchema } from "@/lib/custom-colours-schema"
import {
  createCustomPreset,
  customPresetLimitResponse,
  reachedCustomPresetLimit,
} from "@/lib/custom-preset-store"
import { resolvePresetFromCode } from "@/lib/preset"

/** A customized preset, saved as it stands. */
const body = z.object({
  presetCode: z.string().trim().min(1).max(32),
  colours: customColoursSchema,
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

  const id = await createCustomPreset({
    userId: user.id,
    presetCode: parsed.data.presetCode,
    colours: parsed.data.colours,
    chatId: null,
  })
  return NextResponse.json({ id })
}
