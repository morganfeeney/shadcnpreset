import { readStoredColours, type CustomColours } from "@/lib/custom-colours"
import { query } from "@/lib/db"

export type StoredCustomPreset = {
  id: string
  userId: string
  presetCode: string
  colours: CustomColours
}

type Row = {
  id: string
  user_id: string
  preset_code: string
  colours: string
}

/**
 * Custom presets saved before presets were their address. Only read now,
 * for old links and installs; nothing new is saved.
 */
export async function getCustomPreset(
  id: string
): Promise<StoredCustomPreset | null> {
  const { rows } = await query<Row>(
    `SELECT id, user_id, preset_code, colours FROM custom_presets WHERE id = $1`,
    [id]
  )
  const row = rows[0]
  if (!row) return null
  return {
    id: row.id,
    userId: row.user_id,
    presetCode: row.preset_code,
    colours: readStoredColours(row.colours),
  }
}
