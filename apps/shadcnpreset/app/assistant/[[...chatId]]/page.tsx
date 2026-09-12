import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { AssistantChat } from "@/components/assistant/assistant-chat"
import { isAssistantChatId } from "@/lib/assistant-chat-path"

type AssistantPageProps = {
  params: Promise<{ chatId?: string[] }>
}

/**
 * One segment serves both `/assistant` and `/assistant/<chatId>`, so moving
 * between them re-renders this page with new params instead of remounting it
 * and the open conversation survives the trip.
 */
function readChatId(segments: string[] | undefined): string | null {
  if (!segments?.length) {
    return null
  }
  const [chatId, ...rest] = segments
  if (rest.length > 0 || !isAssistantChatId(chatId)) {
    notFound()
  }
  return chatId
}

export async function generateMetadata({
  params,
}: AssistantPageProps): Promise<Metadata> {
  const { chatId } = await params
  // A chat only opens for the account that made it, so it has nothing to index.
  return chatId?.length ? { robots: { index: false, follow: false } } : {}
}

export default async function AssistantPage({ params }: AssistantPageProps) {
  const { chatId } = await params

  return <AssistantChat routeChatId={readChatId(chatId)} />
}
