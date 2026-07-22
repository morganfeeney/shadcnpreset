"use client"

import * as React from "react"

import type { useAssistantChat } from "@/components/assistant/use-assistant-chat"

type AssistantChatContextValue = ReturnType<typeof useAssistantChat>

const AssistantChatContext = React.createContext<AssistantChatContextValue | null>(
  null
)

export function AssistantChatProvider({
  value,
  children,
}: {
  value: AssistantChatContextValue
  children: React.ReactNode
}) {
  return (
    <AssistantChatContext.Provider value={value}>
      {children}
    </AssistantChatContext.Provider>
  )
}

export function useAssistantChatContext() {
  const context = React.useContext(AssistantChatContext)
  if (!context) {
    throw new Error("useAssistantChatContext must be used within AssistantChatProvider.")
  }
  return context
}
