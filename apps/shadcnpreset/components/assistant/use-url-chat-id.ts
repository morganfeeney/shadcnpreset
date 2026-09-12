"use client"

import { useParams } from "next/navigation"

import { isAssistantChatId } from "@/lib/assistant-chat-path"

/**
 * Which chat the URL names.
 *
 * Read through the client hook rather than a page's `params` prop: a
 * client-side navigation back to the chat you just left moves the URL and
 * re-renders, but hands the page the params it already had. The prop is
 * reliable on the first render only.
 */
export function useUrlChatId(): string | null {
  const params = useParams<{ chatId?: string[] }>()
  const chatId = params.chatId?.[0]
  return isAssistantChatId(chatId) ? chatId : null
}
