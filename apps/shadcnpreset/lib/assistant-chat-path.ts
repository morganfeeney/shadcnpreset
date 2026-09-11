/**
 * Assistant chats are addressable at `/assistant/<chatId>`. Ids are the UUIDs
 * minted by the chat store, so anything else is not a chat we can open.
 */
const ASSISTANT_CHAT_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isAssistantChatId(
  value: string | undefined | null
): value is string {
  return typeof value === "string" && ASSISTANT_CHAT_ID_PATTERN.test(value)
}

/** Path for a chat, falling back to the new-chat page when there is none. */
export function assistantChatPath(chatId?: string | null): string {
  return isAssistantChatId(chatId) ? `/assistant/${chatId}` : "/assistant"
}

/** The chat a `/assistant/...` pathname points at, if it points at one. */
export function assistantChatIdFromPath(pathname: string): string | null {
  const chatId = pathname.startsWith("/assistant/")
    ? pathname.slice("/assistant/".length)
    : null
  return isAssistantChatId(chatId) ? chatId : null
}
