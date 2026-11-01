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
 * Saves a custom preset and returns its id. The id is also the install link,
 * so it is random rather than counted.
 */
export async function createCustomPreset({
  userId,
  presetCode,
  colours,
  chatId,
}: {
  userId: string
  presetCode: string
  colours: CustomColours
  chatId: string | null
}): Promise<string> {
  const id = crypto.randomUUID()
  const now = Date.now()
  await query(
    `
    INSERT INTO custom_presets
      (id, user_id, preset_code, colours, chat_id, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, $6)
    `,
    [id, userId, presetCode, JSON.stringify(colours), chatId, now]
  )
  return id
}

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

/** Saves a custom preset's preset and colours. Only its owner can; false otherwise. */
export async function updateCustomPreset({
  id,
  userId,
  presetCode,
  colours,
}: {
  id: string
  userId: string
  presetCode: string
  colours: CustomColours
}): Promise<boolean> {
  const { rowCount } = await query(
    `
    UPDATE custom_presets SET preset_code = $3, colours = $4, updated_at = $5
    WHERE id = $1 AND user_id = $2
    `,
    [id, userId, presetCode, JSON.stringify(colours), Date.now()]
  )
  return (rowCount ?? 0) > 0
}
