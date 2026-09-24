import {
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

const PAGE_BLOCK_IDS = new Set(
  PAGE_SECTIONS.flatMap(
    (section) => PAGE_BLOCK_VARIANTS[section.id]?.map((v) => v.id) ?? []
  )
)

/**
 * The ids a page can stack, in the order given. The visitor owns the order,
 * so nothing is sorted; unknown ids and layout blocks (headers, sidebars,
 * footers, which fill slots) are dropped. Any kind's blocks can share a page.
 */
export function knownBlocks(ids: Iterable<string>): string[] {
  return [...ids].filter((id) => PAGE_BLOCK_IDS.has(id))
}

const DASHBOARD_ONLY = new Set(
  PAGE_SECTIONS.filter(
    (section) => section.kinds.length === 1 && section.kinds[0] === "dashboard"
  ).map((section) => section.id)
)

/** Dashboard widgets are cards, laid out in a grid rather than stacked. */
export function isDashboardWidget(blockId: string): boolean {
  return DASHBOARD_ONLY.has(sectionOfBlock(blockId))
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
