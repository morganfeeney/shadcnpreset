import { NextResponse } from "next/server"

import { getAssistantChatForUser } from "@/lib/assistant-chat-store"
import { getSessionUser } from "@/lib/auth"

export async function GET(
  _request: Request,
  context: { params: Promise<{ chatId: string }> }
) {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized", code: "auth_required" },
      { status: 401 }
    )
  }

  const { chatId } = await context.params
  const chat = await getAssistantChatForUser(user.id, chatId)
  if (!chat) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json({ chat })
}
