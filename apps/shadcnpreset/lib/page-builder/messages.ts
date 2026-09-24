import { knownBlocks, knownLayout } from "@/lib/page-builder/blocks"
import {
  LAYOUT_SLOTS,
  type LayoutSlot,
  type PageLayout,
} from "@/lib/page-builder/sections"

/** Everything the preview frame renders: the page's blocks and layout. */
export type BuiltPageSpec = {
  blocks: string[]
  layout: PageLayout
}

/** Reads a spec from the frame's URL or a message, keeping what can render. */
export function readBuiltPageSpec(
  input: Partial<Record<string, unknown>>
): BuiltPageSpec {
  const blocks =
    typeof input.blocks === "string"
      ? input.blocks.split(",")
      : Array.isArray(input.blocks)
        ? input.blocks.filter((id): id is string => typeof id === "string")
        : []
  return { blocks: knownBlocks(blocks), layout: knownLayout(input) }
}

/** The frame's URL for a spec; the preset is the only thing that reloads it. */
export function builtPageSrc(preset: string, spec: BuiltPageSpec): string {
  const params = new URLSearchParams({ preset, blocks: spec.blocks.join(",") })
  for (const slot of LAYOUT_SLOTS) {
    const id = spec.layout[slot]
    if (id) params.set(slot, id)
  }
  return `/preset-preview/builder?${params}`
}

/**
 * The builder re-lays out a loaded frame by message instead of reloading it,
 * so every edit costs a repaint. Only a preset change reloads, since the
 * preset's CSS is rendered on the server.
 */
export const PAGE_BUILDER_BLOCKS_MESSAGE_TYPE =
  "shadcnpreset:page-builder-blocks"

export function pageBuilderBlocksMessage(spec: BuiltPageSpec) {
  return {
    type: PAGE_BUILDER_BLOCKS_MESSAGE_TYPE,
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

/**
 * Sent by the frame when the visitor edits the page in place, from the
 * toolbar on each block. The builder owns the page, so the frame only asks;
 * the change comes back as a layout message like any other.
 */
export const PAGE_BUILDER_EDIT_MESSAGE_TYPE = "shadcnpreset:page-builder-edit"

/**
 * Moves and removals name the block as well as its position: the frame's
 * view can be a step behind — a double-click lands before the first change
 * comes back — and the block is how the builder tells.
 */
export type PageEdit =
  | { action: "move"; index: number; block: string; by: -1 | 1 }
  | { action: "remove"; index: number; block: string }
  | { action: "clear"; slot: LayoutSlot }

export function pageBuilderEditMessage(edit: PageEdit) {
  return { type: PAGE_BUILDER_EDIT_MESSAGE_TYPE, ...edit }
}

/** The edit a message asks for, or null for anything else. */
export function readPageBuilderEditMessage(value: unknown): PageEdit | null {
  if (!value || typeof value !== "object") return null
  const m = value as Record<string, unknown>
  if (m.type !== PAGE_BUILDER_EDIT_MESSAGE_TYPE) return null
  const index = Number.isInteger(m.index) ? (m.index as number) : null
  const block = typeof m.block === "string" ? m.block : null
  if (
    m.action === "move" &&
    index !== null &&
    block !== null &&
    (m.by === -1 || m.by === 1)
  ) {
    return { action: "move", index, block, by: m.by }
  }
  if (m.action === "remove" && index !== null && block !== null) {
    return { action: "remove", index, block }
  }
  if (
    m.action === "clear" &&
    typeof m.slot === "string" &&
    (LAYOUT_SLOTS as readonly string[]).includes(m.slot)
  ) {
    return { action: "clear", slot: m.slot as LayoutSlot }
  }
  return null
}
