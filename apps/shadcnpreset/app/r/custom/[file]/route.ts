import { NextResponse } from "next/server"

import {
  buildCustomPreset,
  customPresetRegistryItem,
} from "@/lib/custom-preset"
import { getCustomPreset } from "@/lib/custom-preset-store"
import { countInstallQuietly } from "@/lib/install-counts"

/**
 * A custom preset's colours as a shadcn registry item, for
 * `shadcn add https://…/r/custom/<id>.json`. The CLI fetches it without a
 * session, so the id in the link is what grants it.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ file: string }> }
) {
  const { file } = await params
  const id = file.replace(/\.json$/, "")
  const stored = await getCustomPreset(id)
  const preset = stored && buildCustomPreset(stored.presetCode, stored.colours)
  if (!stored || !preset) {
    return NextResponse.json({ error: "Not found." }, { status: 404 })
  }
  await countInstallQuietly(request, stored.presetCode)
  return NextResponse.json(customPresetRegistryItem(id, preset))
}
