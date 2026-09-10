export const GENERATED_PREVIEW_MESSAGE_TYPE = "shadcnpreset:generated-preview" as const
export const GENERATED_PREVIEW_READY_MESSAGE_TYPE =
  "shadcnpreset:generated-preview-ready" as const

export type GeneratedPreviewPayload = {
  title: string
  code: string
}

export type GeneratedPreviewMessage = GeneratedPreviewPayload & {
  type: typeof GENERATED_PREVIEW_MESSAGE_TYPE
}

export type GeneratedPreviewReadyMessage = {
  type: typeof GENERATED_PREVIEW_READY_MESSAGE_TYPE
}

export function isGeneratedPreviewMessage(
  value: unknown
): value is GeneratedPreviewMessage {
  if (!value || typeof value !== "object") return false
  const candidate = value as Record<string, unknown>
  return (
    candidate.type === GENERATED_PREVIEW_MESSAGE_TYPE &&
    typeof candidate.title === "string" &&
    typeof candidate.code === "string"
  )
}

export function isGeneratedPreviewReadyMessage(
  value: unknown
): value is GeneratedPreviewReadyMessage {
  if (!value || typeof value !== "object") return false
  const candidate = value as Record<string, unknown>
  return candidate.type === GENERATED_PREVIEW_READY_MESSAGE_TYPE
}
