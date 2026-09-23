import { readFileSync } from "node:fs"
import { renderToString } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

// Needs Next's router and fonts; icon names are checked against their
// packages separately.
vi.mock("@/components/icon-placeholder", () => ({
  IconPlaceholder: () => <svg />,
}))

import { PAGE_BLOCK_VARIANTS } from "@/lib/page-builder/variants"

const ids = Object.values(PAGE_BLOCK_VARIANTS)
  .flat()
  .map((v) => v.id)

/**
 * Every block the builder can place renders on its own with no props. Guards
 * the import rewrites: a wrong path or export only fails when a visitor's
 * page happens to include that block.
 */
describe("every catalog block server-renders", () => {
  it.each(ids)("%s", async (id) => {
    const mod = await import(
      `@/components/shadcncraft-examples/blocks/${id}/index.tsx`
    )
    const src = readFileSync(
      `components/shadcncraft-examples/blocks/${id}/index.tsx`,
      "utf8"
    )
    const name = src.match(/^export (?:default )?function ([A-Z]\w*)/m)![1]
    const Component = mod[name] ?? mod.default
    expect(Component).toBeTypeOf("function")
    const html = renderToString(<Component />)
    expect(html.length).toBeGreaterThan(100)
  })
})
