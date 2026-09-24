import { existsSync, readFileSync } from "node:fs"
import { renderToString } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

// Needs Next's router and fonts; icon names are checked against their
// packages separately.
vi.mock("@/components/icon-placeholder", () => ({
  IconPlaceholder: () => <svg />,
}))

import { SidebarProvider } from "@/components/cn-ui/sidebar"
import { sectionOfBlock } from "@/lib/page-builder/blocks"
import { PAGE_BLOCK_VARIANTS } from "@/lib/page-builder/variants"

const ids = Object.values(PAGE_BLOCK_VARIANTS)
  .flat()
  .map((v) => v.id)

/** The module the builder loads, as scripts/generate-page-builder-catalog.ts does. */
function modulePath(id: string) {
  return sectionOfBlock(id) === "app-shell"
    ? `${id}/components/app-sidebar`
    : `${id}/index`
}

/**
 * Every block the builder can place renders as the builder renders it: with
 * no props but a hero's `navigation={false}`, inside the sidebar provider an
 * app header needs. Guards the import rewrites — a wrong path or export only
 * fails when a visitor's page happens to include that block.
 */
describe("every catalog block server-renders", () => {
  it.each(ids)("%s", async (id) => {
    const file = modulePath(id)
    const mod = await import(`@/components/shadcncraft/blocks/${file}.tsx`)
    const src = readFileSync(
      `components/shadcncraft/blocks/${file}.tsx`,
      "utf8"
    )
    const name = src.match(/^export (?:default )?function ([A-Z]\w*)/m)![1]
    const Component = mod[name] ?? mod.default
    expect(Component).toBeTypeOf("function")
    const html = renderToString(
      <SidebarProvider>
        {sectionOfBlock(id) === "hero" ? (
          <Component navigation={false} />
        ) : (
          <Component />
        )}
      </SidebarProvider>
    )
    expect(html.length).toBeGreaterThan(100)
  })
})

/**
 * The block browser shows each block as a screenshot, which only
 * `pnpm generate:page-builder-thumbnails` makes. A block imported without
 * them shows an empty card.
 */
describe("every catalog block has thumbnails", () => {
  it.each(ids)("%s", (id) => {
    for (const theme of ["light", "dark"]) {
      expect(
        existsSync(`public/page-builder/thumbnails/${theme}/${id}.jpg`),
        `${theme} thumbnail`
      ).toBe(true)
    }
  })
})
