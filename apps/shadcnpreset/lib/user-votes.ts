import { query } from "@/lib/db"
import { resolvePresetFromCode } from "@/lib/preset"
import type { PresetPageItem } from "@/lib/preset-catalog"

type VoteRow = {
  preset_code: string
}

export async function getVotedPresetsForUser(
  userId: string
): Promise<PresetPageItem[]> {
  const result = await query<VoteRow>(
    `
    SELECT preset_code
    FROM preset_votes
    WHERE user_id = $1
    ORDER BY created_at DESC
    `,
    [userId]
  )

  const items: PresetPageItem[] = []
  for (const row of result.rows) {
    const preset = resolvePresetFromCode(row.preset_code)
    if (!preset) continue
    items.push({
      index: items.length,
      code: preset.code,
      config: preset,
    })
  }
  return items
}
