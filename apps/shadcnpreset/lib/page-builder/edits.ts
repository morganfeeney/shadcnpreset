import type { PageEdit } from "@/lib/page-builder/messages"
import type { PageLayout } from "@/lib/page-builder/sections"

/**
 * A page as the builder holds it. Items carry whatever identity the builder
 * needs (a key that survives reordering); edits address them by position,
 * as the frame sees them.
 */
export type EditablePage<Item> = { items: Item[]; layout: PageLayout }

/**
 * Applies one in-place edit. An edit that no longer fits the page — a stale
 * index from a message that crossed another edit — changes nothing.
 */
export function applyPageEdit<Item>(
  page: EditablePage<Item>,
  edit: PageEdit
): EditablePage<Item> {
  switch (edit.action) {
    case "move": {
      const to = edit.index + edit.by
      if (!page.items[edit.index] || to < 0 || to >= page.items.length) {
        return page
      }
      const items = [...page.items]
      ;[items[edit.index], items[to]] = [items[to], items[edit.index]]
      return { ...page, items }
    }
    case "remove": {
      if (!page.items[edit.index]) return page
      return {
        ...page,
        items: page.items.filter((_, index) => index !== edit.index),
      }
    }
    case "clear":
      return { ...page, layout: { ...page.layout, [edit.slot]: null } }
  }
}
