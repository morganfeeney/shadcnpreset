import { query } from "@/lib/db"

/**
 * Assistant answers someone gets before Pro, over all time. Unset means no
 * limit, which is how it stays until Pro can be paid for: a wall with no way
 * through would only turn people away.
 */
export function freeGenerationLimit(): number | null {
  const raw = process.env.ASSISTANT_FREE_GENERATIONS
  if (!raw) return null
  const limit = Number.parseInt(raw, 10)
  return Number.isFinite(limit) && limit >= 0 ? limit : null
}

export async function getGenerations(userId: string): Promise<number> {
  const { rows } = await query<{ generations: number }>(
    `SELECT generations FROM assistant_usage WHERE user_id = $1`,
    [userId]
  )
  return rows[0]?.generations ?? 0
}

/**
 * Counts an answer someone got. Kept apart from their chats, so deleting a
 * chat does not hand its answers back.
 */
export async function countGeneration(userId: string): Promise<void> {
  await query(
    `
    INSERT INTO assistant_usage (user_id, generations) VALUES ($1, 1)
    ON CONFLICT (user_id)
    DO UPDATE SET generations = assistant_usage.generations + 1
    `,
    [userId]
  )
}
