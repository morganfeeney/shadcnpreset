import { isPageKind } from "@/lib/page-builder/blocks"
import type { PageKind } from "@/lib/page-builder/sections"

/**
 * The builder re-lays out a loaded frame by message instead of reloading it,
 * so dragging a block costs a repaint. Only a preset change reloads, since
 * the preset's CSS is rendered on the server.
 */
export const PAGE_BUILDER_BLOCKS_MESSAGE_TYPE =
  "shadcnpreset:page-builder-blocks"

export type PageBuilderBlocksMessage = {
  type: typeof PAGE_BUILDER_BLOCKS_MESSAGE_TYPE
  kind: PageKind
  blocks: string[]
}

export function isPageBuilderBlocksMessage(
  value: unknown
): value is PageBuilderBlocksMessage {
  if (!value || typeof value !== "object") return false
  const message = value as Record<string, unknown>
  return (
    message.type === PAGE_BUILDER_BLOCKS_MESSAGE_TYPE &&
    typeof message.kind === "string" &&
    isPageKind(message.kind) &&
    Array.isArray(message.blocks) &&
    message.blocks.every((id) => typeof id === "string")
  )
}

/**
 * Sent by the frame once it is listening. The frame renders its blocks late —
 * after fonts and a lazy chunk — so a layout posted on the iframe's load event
 * can land before anyone hears it, and a reload would leave the frame on the
 * layout in its URL. The builder answers this with the current layout instead.
 */
export const PAGE_BUILDER_READY_MESSAGE_TYPE = "shadcnpreset:page-builder-ready"

export function isPageBuilderReadyMessage(value: unknown): boolean {
  return (
    !!value &&
    typeof value === "object" &&
    (value as Record<string, unknown>).type === PAGE_BUILDER_READY_MESSAGE_TYPE
  )
}
