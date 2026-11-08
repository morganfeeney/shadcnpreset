import { describe, expect, it } from "vitest"

import { extractIconNames } from "@/scripts/generate-icon-allowlists"

describe("extractIconNames", () => {
  it("reads IconPlaceholder props", () => {
    const names = extractIconNames(
      `<IconPlaceholder lucide="ChevronDownIcon" remixicon="RiArrowDownSLine" />`
    )
    expect(names.lucide).toEqual(["ChevronDownIcon"])
    expect(names.remixicon).toEqual(["RiArrowDownSLine"])
  })

  it("reads name maps spread into IconPlaceholder", () => {
    // The preview icon grid keeps its names in an array of maps. Reading only
    // props left the shopping bag (and nine others) out of the allowlists, so
    // those grid cells rendered empty.
    const names = extractIconNames(`{
    lucide: "ShoppingBagIcon",
    tabler: "IconShoppingBag",
    hugeicons: "ShoppingBag01Icon",
    phosphor: "BagIcon",
    remixicon: "RiShoppingBagLine",
  }`)
    expect(names).toEqual({
      lucide: ["ShoppingBagIcon"],
      tabler: ["IconShoppingBag"],
      hugeicons: ["ShoppingBag01Icon"],
      phosphor: ["BagIcon"],
      remixicon: ["RiShoppingBagLine"],
    })
  })

  it("ignores prose values", () => {
    expect(
      extractIconNames(`lucide: "Lucide: clean thin outline icons"`).lucide
    ).toEqual([])
  })
})
