import {
  KIND_LAYOUT,
  LAYOUT_CATEGORIES,
  LAYOUT_SLOTS,
  PAGE_KINDS,
  PAGE_SECTIONS,
  type LayoutSlot,
  type PageKind,
  type PageLayout,
  type PageSection,
} from "@/lib/page-builder/sections"
import { PAGE_BLOCK_VARIANTS } from "@/lib/page-builder/variants"

export function sectionsForKind(kind: PageKind): PageSection[] {
  return PAGE_SECTIONS.filter(
    (section) =>
      section.kinds.includes(kind) && PAGE_BLOCK_VARIANTS[section.id]?.length
  )
}

export function isPageKind(value: string): value is PageKind {
  return (PAGE_KINDS as readonly string[]).includes(value)
}

/** The section a block id belongs to: `hero-4` → `hero`. */
export function sectionOfBlock(blockId: string): string {
  return blockId.replace(/-\d+$/, "")
}

/** Every block the kind can show, grouped by section in page order. */
export function blockChoicesForKind(kind: PageKind) {
  return sectionsForKind(kind).map((section) => ({
    section,
    variants: PAGE_BLOCK_VARIANTS[section.id],
  }))
}

/**
 * The ids a kind can show, in the order given. The visitor owns the order,
 * so nothing is sorted; unknown ids and other kinds' blocks are dropped.
 */
export function knownBlocks(kind: PageKind, ids: Iterable<string>): string[] {
  const allowed = new Set(
    sectionsForKind(kind).flatMap((section) =>
      PAGE_BLOCK_VARIANTS[section.id].map((variant) => variant.id)
    )
  )
  return [...ids].filter((id) => allowed.has(id))
}

/** Every block that can fill a slot, grouped by category. */
export function layoutChoices(slot: LayoutSlot) {
  return LAYOUT_CATEGORIES[slot]
    .map((category) => ({
      category,
      variants: PAGE_BLOCK_VARIANTS[category.id] ?? [],
    }))
    .filter(({ variants }) => variants.length)
}

/** A layout with every id checked against its slot; anything else is none. */
export function knownLayout(
  layout: Partial<Record<string, unknown>>
): PageLayout {
  return Object.fromEntries(
    LAYOUT_SLOTS.map((slot) => {
      const id = layout[slot]
      const allowed =
        typeof id === "string" &&
        LAYOUT_CATEGORIES[slot].some((category) =>
          PAGE_BLOCK_VARIANTS[category.id]?.some((variant) => variant.id === id)
        )
      return [slot, allowed ? id : null]
    })
  ) as PageLayout
}

/** App headers carry a sidebar trigger, so they need the sidebar's provider. */
export function isAppHeader(blockId: string | null): boolean {
  return blockId !== null && sectionOfBlock(blockId) === "app-shell-header"
}

/**
 * A kind's layout before Jev has read anything: the first variant of each
 * category the kind fills its slots from.
 */
export function defaultLayout(kind: PageKind): PageLayout {
  return Object.fromEntries(
    LAYOUT_SLOTS.map((slot) => {
      const category = KIND_LAYOUT[kind][slot]
      return [
        slot,
        category ? (PAGE_BLOCK_VARIANTS[category]?.[0]?.id ?? null) : null,
      ]
    })
  ) as PageLayout
}
