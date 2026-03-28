import { NextResponse } from "next/server"

import { clearSession, createSession, getSessionUser } from "@/lib/auth"

export async function GET() {
  const user = await getSessionUser()
  return NextResponse.json({ user })
}

export async function POST(request: Request) {
  let payload: { name?: string } | null = null

  try {
    payload = (await request.json()) as { name?: string }
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }

  if (!payload?.name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 })
  }

  const session = await createSession(payload.name)
  return NextResponse.json(session)
}

export async function DELETE() {
  await clearSession()
  return NextResponse.json({ ok: true })
}
