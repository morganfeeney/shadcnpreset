import type { Metadata } from "next"

import { ListLayout } from "@/components/list-layout"
import { AssistantChat } from "@/components/assistant/assistant-chat"

export const metadata: Metadata = {
  title: "AI preset finder",
  description:
    "Guided conversation that turns your description into facet choices and live preset previews.",
}

export default function AssistantPage() {
  return (
    <ListLayout>
      <AssistantChat />
    </ListLayout>
  )
}
