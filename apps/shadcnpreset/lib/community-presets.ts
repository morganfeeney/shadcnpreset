import { query } from "@/lib/db"
import { resolvePresetFromCode } from "@/lib/preset"

type CommunityPresetVoteRow = {
  preset_code: string
}

export async function getCommunityPresetCodes() {
  const result = await query<CommunityPresetVoteRow>(
    `
    SELECT preset_code
    FROM preset_votes
    GROUP BY preset_code
    ORDER BY COUNT(*) DESC, preset_code ASC
    `
  )

  const codes: string[] = []

  for (const row of result.rows) {
    const preset = resolvePresetFromCode(row.preset_code)
    if (!preset) continue
    codes.push(preset.code)
  }

  return codes
}
