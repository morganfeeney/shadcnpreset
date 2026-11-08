import { NextResponse } from "next/server"

import { getCustomPreset } from "@/lib/custom-preset-store"

/**
 * A saved custom preset, for an old link to it to turn into its colours.
 * Anyone with the id can read it, as its install link already lets them.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const stored = await getCustomPreset(id)
  if (!stored) {
    return NextResponse.json({ error: "Not found." }, { status: 404 })
  }
  return NextResponse.json({
    id: stored.id,
    presetCode: stored.presetCode,
    colours: stored.colours,
  })
}
