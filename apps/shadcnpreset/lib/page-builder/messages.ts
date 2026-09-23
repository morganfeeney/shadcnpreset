import { isPageKind, knownBlocks, knownLayout } from "@/lib/page-builder/blocks"
import {
  LAYOUT_SLOTS,
  type PageKind,
  type PageLayout,
} from "@/lib/page-builder/sections"

/** Everything the preview frame renders: the page's kind, blocks and layout. */
export type BuiltPageSpec = {
  kind: PageKind
  blocks: string[]
  layout: PageLayout
}

/**
 * Reads a spec from the frame's URL or a message, keeping only what the kind
 * and slots allow. Null when there is no usable kind.
 */
export function readBuiltPageSpec(
  input: Partial<Record<string, unknown>>
): BuiltPageSpec | null {
  const { kind } = input
  if (typeof kind !== "string" || !isPageKind(kind)) return null
  const blocks =
    typeof input.blocks === "string"
      ? input.blocks.split(",")
      : Array.isArray(input.blocks)
        ? input.blocks.filter((id): id is string => typeof id === "string")
        : []
  return {
    kind,
    blocks: knownBlocks(kind, blocks),
    layout: knownLayout(input),
  }
}

/** The frame's URL for a spec; the preset is the only thing that reloads it. */
export function builtPageSrc(preset: string, spec: BuiltPageSpec): string {
  const params = new URLSearchParams({
    preset,
    kind: spec.kind,
    blocks: spec.blocks.join(","),
  })
  for (const slot of LAYOUT_SLOTS) {
    const id = spec.layout[slot]
    if (id) params.set(slot, id)
  }
  return `/preset-preview/builder?${params}`
}

/**
 * The builder re-lays out a loaded frame by message instead of reloading it,
 * so dragging a block costs a repaint. Only a preset change reloads, since
 * the preset's CSS is rendered on the server.
 */
export const PAGE_BUILDER_BLOCKS_MESSAGE_TYPE =
  "shadcnpreset:page-builder-blocks"

export function pageBuilderBlocksMessage(spec: BuiltPageSpec) {
  return {
    type: PAGE_BUILDER_BLOCKS_MESSAGE_TYPE,
    kind: spec.kind,
    blocks: spec.blocks,
    ...spec.layout,
  }
}

/** The spec a layout message carries, or null for anything else. */
export function readPageBuilderBlocksMessage(
  value: unknown
): BuiltPageSpec | null {
  if (!value || typeof value !== "object") return null
  const message = value as Record<string, unknown>
  if (message.type !== PAGE_BUILDER_BLOCKS_MESSAGE_TYPE) return null
  return readBuiltPageSpec(message)
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
