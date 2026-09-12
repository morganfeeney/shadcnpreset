import type { Metadata } from "next"

import { AssistantChat } from "@/components/assistant/assistant-chat"

export const metadata: Metadata = {
  title: "AI powered shadcn preset finder",
  description:
    "Guided conversation that turns your description into facet choices and live preset previews.",
}

export default function AssistantPage() {
  return <AssistantChat />
}
