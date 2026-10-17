import { describe, expect, it } from "vitest"

import {
  presetDetailsPageTitle,
  presetMetaDescription,
  presetPageTitle,
} from "@/lib/data/metadata/preset-meta"
import { getFontDisplayName, resolvePresetFromCode } from "@/lib/preset"

describe("preset page titles", () => {
  it("name the style, theme and font in words, then the code", () => {
    const resolved = resolvePresetFromCode("bw4UuDRY")!
    const style =
      resolved.style.charAt(0).toUpperCase() + resolved.style.slice(1)
    const font = getFontDisplayName(resolved.font)

    expect(presetPageTitle(resolved)).toMatch(
      new RegExp(`^${style} shadcn preset · .+, ${font} \\(bw4UuDRY\\)$`)
    )
    expect(presetDetailsPageTitle(resolved)).toMatch(
      new RegExp(
        `^${style} shadcn preset details · .+, ${font} \\(bw4UuDRY\\)$`
      )
    )
  })
})

describe("presetMetaDescription", () => {
  it("includes key fields from a resolved preset", () => {
    const resolved = resolvePresetFromCode("bw4UuDRY")
    expect(resolved).not.toBeNull()
    const text = presetMetaDescription(resolved!)
    expect(text).toContain("bw4UuDRY")
    expect(text).toContain(resolved!.style)
    expect(text).toContain(resolved!.baseColor)
    expect(text).toContain(resolved!.theme)
  })
})
