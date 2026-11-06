import { NextResponse } from "next/server"
import { z } from "zod"

import { getSessionUser } from "@/lib/auth"
import { customColoursSchema } from "@/lib/custom-colours-schema"
import { getCustomPreset, updateCustomPreset } from "@/lib/custom-preset-store"
import { resolvePresetFromCode } from "@/lib/preset"

const body = z.object({
  presetCode: z.string().trim().min(1).max(32),
  colours: customColoursSchema,
})

/** Saves a custom preset as its page has it: the preset and its colours. */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 })
  }

  const parsed = body.safeParse(await request.json().catch(() => null))
  if (!parsed.success || !resolvePresetFromCode(parsed.data.presetCode)) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  }

  const { id } = await params
  const saved = await updateCustomPreset({
    id,
    userId: user.id,
    ...parsed.data,
  })
  // Someone else's preset reads as missing, not forbidden.
  if (!saved) {
    return NextResponse.json({ error: "Not found." }, { status: 404 })
  }
  return NextResponse.json({ ok: true })
}

/**
 * A custom preset as its editor needs it, for the assistant's panel. Anyone
 * with the id can read it, as the install link already lets them; only its
 * owner may edit.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const [stored, user] = await Promise.all([
    getCustomPreset(id),
    getSessionUser(),
  ])
  if (!stored) {
    return NextResponse.json({ error: "Not found." }, { status: 404 })
  }
  return NextResponse.json({
    id: stored.id,
    presetCode: stored.presetCode,
    colours: stored.colours,
    canEdit: user?.id === stored.userId,
  })
}
