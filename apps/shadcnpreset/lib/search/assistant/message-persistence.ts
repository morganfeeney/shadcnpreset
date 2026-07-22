export type AssistantRequestMessage = {
  role: "user" | "assistant"
  content: string
  kind?: "text" | "presets"
  presets?: Array<{ code: string; caption: string; description: string }>
  followUpQuestions?: string[]
}

export type PersistedAssistantMessage = {
  role: "user" | "assistant"
  kind: "text" | "presets"
  content: string
  presets?: Array<{ code: string; caption: string; description: string }>
  followUpQuestions?: string[]
}

export function toPersistedAssistantMessage(
  message: AssistantRequestMessage
): PersistedAssistantMessage {
  if (message.role === "user") {
    return {
      role: "user",
      kind: "text",
      content: message.content,
    }
  }

  if (
    message.kind === "presets" &&
    Array.isArray(message.presets) &&
    message.presets.length > 0
  ) {
    return {
      role: "assistant",
      kind: "presets",
      content: message.content,
      presets: message.presets.slice(0, 4),
    }
  }

  return {
    role: "assistant",
    kind: "text",
    content: message.content,
    followUpQuestions: Array.isArray(message.followUpQuestions)
      ? message.followUpQuestions
          .map((q) => q.trim())
          .filter((q) => q.length > 0)
          .slice(0, 4)
      : undefined,
  }
}
