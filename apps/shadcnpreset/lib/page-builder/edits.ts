import type { PageEdit } from "@/lib/page-builder/messages"
import type { PageLayout } from "@/lib/page-builder/sections"

/**
 * A page as the builder holds it. Items carry whatever else the builder
 * needs (a key that survives reordering) beside their block; edits address
 * them by position, as the frame sees them.
 */
export type EditablePage<Item extends { block: string }> = {
  items: Item[]
  layout: PageLayout
}

/**
 * Applies one in-place edit, if it still describes the page. The frame asks
 * from what it last drew, so an edit can arrive after an earlier one has
 * already moved things: a double-click on remove would otherwise take out
 * whichever block slid into the first one's place. An edit whose position no
 * longer holds its block changes nothing.
 */
export function applyPageEdit<Item extends { block: string }>(
  page: EditablePage<Item>,
  edit: PageEdit
): EditablePage<Item> {
  if (edit.action !== "clear" && page.items[edit.index]?.block !== edit.block) {
    return page
  }
  switch (edit.action) {
    case "move": {
      const to = edit.index + edit.by
      if (to < 0 || to >= page.items.length) return page
      const items = [...page.items]
      ;[items[edit.index], items[to]] = [items[to], items[edit.index]]
      return { ...page, items }
    }
    case "remove": {
      return {
        ...page,
        items: page.items.filter((_, index) => index !== edit.index),
      }
    }
    case "clear":
      return { ...page, layout: { ...page.layout, [edit.slot]: null } }
  }
}
