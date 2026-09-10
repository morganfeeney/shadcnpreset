import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

import { GENERATED_PREVIEW_COMPONENT_NAMES } from "@/lib/generated-preview/catalog"
import { extractScopeNames } from "@/scripts/generate-preview-catalog"

/**
 * The prompt advertises the catalog, so anything it names must resolve in the
 * scope at render time. Read as text rather than importing scope.tsx, which
 * would pull every component into the test environment.
 */
const scopeSource = readFileSync(
  path.join(import.meta.dirname, "scope.tsx"),
  "utf8"
)

describe("generated preview catalog", () => {
  it("matches the identifiers bound in the scope", () => {
    expect([...GENERATED_PREVIEW_COMPONENT_NAMES]).toEqual(
      extractScopeNames(scopeSource)
    )
  })

  it("includes subcomponents, not just top-level names", () => {
    // Advertising `Drawer` alone made the model guess `DrawerBody`.
    expect(GENERATED_PREVIEW_COMPONENT_NAMES).toContain("Drawer")
    expect(GENERATED_PREVIEW_COMPONENT_NAMES).toContain("DrawerContent")
    expect(GENERATED_PREVIEW_COMPONENT_NAMES).toContain("DrawerHeader")
    expect(GENERATED_PREVIEW_COMPONENT_NAMES).not.toContain("DrawerBody")
  })
})
