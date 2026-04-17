import { query } from "@/lib/db"

const MAX_TITLE_LENGTH = 120
const MAX_PRESETS_LENGTH = 12000

type PersistedAssistantMessage = {
  role: "user" | "assistant"
  kind: "text" | "presets"
  content: string
  presets?: Array<{ code: string; caption: string; description: string }>
}

type ChatRow = {
  id: string
  title: string
  created_at: number
  updated_at: number
}

type ChatMessageRow = {
  role: "user" | "assistant"
  kind: "text" | "presets"
  content: string
  presets_json: string | null
  created_at: number
}

export type AssistantChatListItem = {
  id: string
  title: string
  updatedAt: number
  createdAt: number
}

export type AssistantChatDetail = AssistantChatListItem & {
  messages: PersistedAssistantMessage[]
}

function deriveChatTitleFromMessages(messages: PersistedAssistantMessage[]): string {
  const firstUserMessage = messages.find((message) => message.role === "user")
  const base = (firstUserMessage?.content ?? "").trim()
  if (!base) {
    return "New chat"
  }
  return base.slice(0, MAX_TITLE_LENGTH)
}

function parsePresets(raw: string | null): PersistedAssistantMessage["presets"] {
  if (!raw || raw.length > MAX_PRESETS_LENGTH) {
    return undefined
  }
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) {
      return undefined
    }
    const presets = parsed
      .filter(
        (item): item is { code: string; caption: string; description: string } =>
          Boolean(item) &&
          typeof item === "object" &&
          "code" in item &&
          "caption" in item &&
          "description" in item &&
          typeof item.code === "string" &&
          typeof item.caption === "string" &&
          typeof item.description === "string"
      )
      .slice(0, 4)

    return presets.length ? presets : undefined
  } catch {
    return undefined
  }
}

export async function ensureAssistantUserRecord(user: { id: string; name: string }) {
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

export async function listAssistantChatsForUser(
  userId: string
): Promise<AssistantChatListItem[]> {
  const result = await query<ChatRow>(
    `
    SELECT id, title, created_at, updated_at
    FROM assistant_chats
    WHERE user_id = $1
    ORDER BY updated_at DESC
    LIMIT 50
    `,
    [userId]
  )

  return result.rows.map((row) => ({
    id: row.id,
    title: row.title,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }))
}

export async function getAssistantChatForUser(
  userId: string,
  chatId: string
): Promise<AssistantChatDetail | null> {
  const chatResult = await query<ChatRow>(
    `
    SELECT id, title, created_at, updated_at
    FROM assistant_chats
    WHERE id = $1 AND user_id = $2
    LIMIT 1
    `,
    [chatId, userId]
  )
  const chatRow = chatResult.rows[0]
  if (!chatRow) {
    return null
  }

  const messagesResult = await query<ChatMessageRow>(
    `
    SELECT role, kind, content, presets_json, created_at
    FROM assistant_chat_messages
    WHERE chat_id = $1
    ORDER BY position ASC
    `,
    [chatId]
  )

  return {
    id: chatRow.id,
    title: chatRow.title,
    createdAt: chatRow.created_at,
    updatedAt: chatRow.updated_at,
    messages: messagesResult.rows.map((row) => ({
      role: row.role,
      kind: row.kind,
      content: row.content,
      presets: parsePresets(row.presets_json),
    })),
  }
}

export async function saveAssistantChatForUser(args: {
  user: { id: string; name: string }
  chatId?: string
  messages: PersistedAssistantMessage[]
}): Promise<{ chatId: string; title: string; updatedAt: number; createdAt: number }> {
  await ensureAssistantUserRecord(args.user)

  const now = Date.now()
  const chatId = args.chatId?.trim() || crypto.randomUUID()
  const title = deriveChatTitleFromMessages(args.messages)

  await query(
    `
    INSERT INTO assistant_chats (id, user_id, title, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (id)
    DO UPDATE
      SET title = EXCLUDED.title,
          updated_at = EXCLUDED.updated_at
      WHERE assistant_chats.user_id = EXCLUDED.user_id
    `,
    [chatId, args.user.id, title, now, now]
  )

  const ownershipResult = await query<{ id: string }>(
    `
    SELECT id
    FROM assistant_chats
    WHERE id = $1 AND user_id = $2
    LIMIT 1
    `,
    [chatId, args.user.id]
  )
  if (!ownershipResult.rows[0]) {
    throw new Error("Unauthorized chat access")
  }

  await query("DELETE FROM assistant_chat_messages WHERE chat_id = $1", [chatId])

  for (let index = 0; index < args.messages.length; index += 1) {
    const message = args.messages[index]!
    const presetsJson =
      message.kind === "presets" && message.presets?.length
        ? JSON.stringify(message.presets.slice(0, 4))
        : null

    await query(
      `
      INSERT INTO assistant_chat_messages
        (chat_id, position, role, kind, content, presets_json, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      `,
      [
        chatId,
        index,
        message.role,
        message.kind,
        message.content,
        presetsJson,
        now + index,
      ]
    )
  }

  return {
    chatId,
    title,
    createdAt: now,
    updatedAt: now,
  }
}
