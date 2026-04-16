import { NextResponse } from "next/server"

import { listAssistantChatsForUser } from "@/lib/assistant-chat-store"
import { getSessionUser } from "@/lib/auth"

export async function GET() {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized", code: "auth_required" },
      { status: 401 }
    )
  }

  const chats = await listAssistantChatsForUser(user.id)
  return NextResponse.json({ chats })
}
