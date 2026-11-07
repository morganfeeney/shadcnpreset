import { notFound, redirect } from "next/navigation"
import { connection } from "next/server"

import { getCustomPreset } from "@/lib/custom-preset-store"
import { customPresetPath } from "@/lib/preset-draft"

/** Links shared before saved presets moved onto their preset's page. */
export default async function CustomPresetRedirect({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await connection()
  const { id } = await params
  const stored = await getCustomPreset(id)
  if (!stored) notFound()
  redirect(customPresetPath(stored.id, stored.presetCode))
}
