import { notFound, redirect } from "next/navigation"
import { connection } from "next/server"

import { getCustomPreset } from "@/lib/custom-preset-store"
import { customColoursPath } from "@/lib/preset-draft"

/**
 * Links shared to a saved custom preset, from before presets were their
 * address: its preset's page, with its colours in the address.
 */
export default async function CustomPresetRedirect({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await connection()
  const { id } = await params
  const stored = await getCustomPreset(id)
  if (!stored) notFound()
  redirect(customColoursPath(stored.presetCode, stored.colours))
}
