import {
  PAGE_KINDS,
  PAGE_SECTIONS,
  type PageKind,
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
