import { NextResponse } from "next/server"

import { customColoursSchema } from "@/lib/custom-colours-schema"
import {
  buildCustomPreset,
  customPresetRegistryItem,
  readRegistryColours,
} from "@/lib/custom-preset"

/**
 * A preset's custom colours as a shadcn registry item, for
 * `shadcn add https://…/r/colours/<preset>/<colours>.json`. The colours are
 * in the link itself (`customColoursRegistryPath`), so it needs no account
 * and nothing saved.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string; file: string }> }
) {
  const { code, file } = await params
  const colours = customColoursSchema.safeParse(readRegistryColours(file))
  const preset = colours.success && buildCustomPreset(code, colours.data)
  if (!preset) {
    return NextResponse.json({ error: "Not found." }, { status: 404 })
  }
  return NextResponse.json(customPresetRegistryItem(code, preset))
}
