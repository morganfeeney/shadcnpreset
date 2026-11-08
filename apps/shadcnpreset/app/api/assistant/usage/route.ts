import { connection, NextResponse } from "next/server"

import { freeGenerationLimit, getGenerations } from "@/lib/assistant-usage"
import { getSessionUser } from "@/lib/auth"

/**
 * How many free generations someone has had, against the limit (null while
 * there is none), so a composer can say how many are left before a send
 * hits the wall. Signed out, none yet.
 */
export async function GET() {
  await connection()
  const limit = freeGenerationLimit()
  const user = limit === null ? null : await getSessionUser()
  const used = user ? await getGenerations(user.id) : 0
  return NextResponse.json({ used, limit })
}
