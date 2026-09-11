import type { AssistantGeneratedPreview } from "@/lib/search/assistant/schema"

export type AssistantRequestMessage = {
  role: "user" | "assistant"
  content: string
  kind?: "text" | "presets" | "preview"
  presets?: Array<{ code: string; caption: string; description: string }>
  preview?: AssistantGeneratedPreview
  followUpQuestions?: string[]
}

export type PersistedAssistantMessage = {
  role: "user" | "assistant"
  kind: "text" | "presets" | "preview"
  content: string
  presets?: Array<{ code: string; caption: string; description: string }>
  preview?: AssistantGeneratedPreview
  followUpQuestions?: string[]
}

function isPreviewPayload(value: unknown): value is AssistantGeneratedPreview {
  if (!value || typeof value !== "object") return false
  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.title === "string" &&
    candidate.title.trim().length > 0 &&
    typeof candidate.code === "string" &&
    candidate.code.trim().length > 0
  )
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

  if (message.kind === "preview" && isPreviewPayload(message.preview)) {
    const presetCode = message.preview.presetCode?.trim()
    return {
      role: "assistant",
      kind: "preview",
      content: message.content,
      preview: {
        title: message.preview.title.trim().slice(0, 60),
        code: message.preview.code,
        ...(presetCode ? { presetCode } : {}),
      },
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
