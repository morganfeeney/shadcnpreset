import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

import { getSessionUser } from "@/lib/auth"
import { query } from "@/lib/db"
import { isCanonicalPresetCode } from "@/lib/preset-codec"

type CountRow = {
  votes: number
}

type VoteExistsRow = { exists: number }

async function getVoteCount(code: string) {
  const result = await query<CountRow>(
    "SELECT COUNT(*)::int as votes FROM preset_votes WHERE preset_code = $1",
    [code]
  )
  const row = result.rows[0]
  return row?.votes ?? 0
}

async function ensureUserRecord(user: { id: string; name: string }) {
  await query(
    `
    INSERT INTO users (id, name, created_at)
    VALUES ($1, $2, $3)
    ON CONFLICT (id)
    DO UPDATE SET name = EXCLUDED.name
    `,
    [user.id, user.name, Date.now()]
  )
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ code: string }> }
) {
  const { code } = await context.params
  if (!isCanonicalPresetCode(code)) {
    return NextResponse.json({ error: "Invalid preset code" }, { status: 400 })
  }

  const user = await getSessionUser()
  const votes = await getVoteCount(code)

  if (!user) {
    return NextResponse.json({ votes, hasVoted: false, authenticated: false })
  }

  const voteResult = await query<VoteExistsRow>(
    "SELECT 1 as exists FROM preset_votes WHERE user_id = $1 AND preset_code = $2 LIMIT 1",
    [user.id, code]
  )
  const row = voteResult.rows[0]

  return NextResponse.json({
    votes,
    hasVoted: Boolean(row?.exists),
    authenticated: true,
    user,
  })
}

export async function POST(
  _request: Request,
  context: { params: Promise<{ code: string }> }
) {
  const { code } = await context.params
  if (!isCanonicalPresetCode(code)) {
    return NextResponse.json({ error: "Invalid preset code" }, { status: 400 })
  }

  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  await ensureUserRecord(user)

  const existingResult = await query<VoteExistsRow>(
    "SELECT 1 as exists FROM preset_votes WHERE user_id = $1 AND preset_code = $2 LIMIT 1",
    [user.id, code]
  )
  const existing = existingResult.rows[0]

  const now = Date.now()
  let hasVoted: boolean
  if (existing?.exists) {
    await query(
      "DELETE FROM preset_votes WHERE user_id = $1 AND preset_code = $2",
      [user.id, code]
    )
    hasVoted = false
  } else {
    await query(
      "INSERT INTO preset_votes (user_id, preset_code, created_at) VALUES ($1, $2, $3)",
      [user.id, code, now]
    )
    hasVoted = true
  }

  revalidatePath("/")
  revalidatePath("/my-presets")
  revalidatePath(`/preset/${code}`)

  return NextResponse.json({
    votes: await getVoteCount(code),
    hasVoted,
    authenticated: true,
    user,
  })
}
