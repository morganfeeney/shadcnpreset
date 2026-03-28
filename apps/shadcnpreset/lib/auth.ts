import { randomUUID } from "node:crypto"

import { cookies } from "next/headers"

import { query } from "@/lib/db"

const SESSION_COOKIE_NAME = "shadcnpreset_session"
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30

export type SessionUser = {
  id: string
  name: string
}

export async function createSession(name: string) {
  const trimmedName = name.trim().slice(0, 48)
  if (!trimmedName) {
    throw new Error("Name is required")
  }

  const now = Date.now()
  const userId = randomUUID()
  const token = randomUUID()
  const expiresAt = now + SESSION_MAX_AGE_SECONDS * 1000

  await query(
    "INSERT INTO users (id, name, created_at) VALUES ($1, $2, $3)",
    [userId, trimmedName, now]
  )
  await query(
    "INSERT INTO sessions (token, user_id, expires_at) VALUES ($1, $2, $3)",
    [token, userId, expiresAt]
  )

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  })

  return {
    user: {
      id: userId,
      name: trimmedName,
    },
  }
}

export async function clearSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (token) {
    await query("DELETE FROM sessions WHERE token = $1", [token])
  }

  cookieStore.delete(SESSION_COOKIE_NAME)
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!token) {
    return null
  }

  const result = await query<{
    user_id: string
    name: string
    expires_at: string | number
  }>(
    `
      SELECT sessions.user_id, users.name, sessions.expires_at
      FROM sessions
      INNER JOIN users ON users.id = sessions.user_id
      WHERE sessions.token = $1
      `,
    [token]
  )
  const row = result.rows[0]

  if (!row) {
    cookieStore.delete(SESSION_COOKIE_NAME)
    return null
  }

  if (Number(row.expires_at) <= Date.now()) {
    await query("DELETE FROM sessions WHERE token = $1", [token])
    cookieStore.delete(SESSION_COOKIE_NAME)
    return null
  }

  return {
    id: row.user_id,
    name: row.name,
  }
}
