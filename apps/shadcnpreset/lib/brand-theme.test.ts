import { describe, expect, it } from "vitest"

import { readBrandColours } from "@/lib/brand-theme"

describe("readBrandColours", () => {
  it("reads the token each colour is named for", () => {
    expect(
      readBrandColours(
        "Background #141414, Foreground #E8E3DA, Primary #D1CFC0, Primary Foreground #363636"
      )
    ).toEqual([
      { colour: "#141414", token: "background" },
      { colour: "#E8E3DA", token: "foreground" },
      { colour: "#D1CFC0", token: "primary" },
      { colour: "#363636", token: "primary-foreground" },
    ])
  })

  it("reads CSS variables and plain sentences as labels", () => {
    expect(
      readBrandColours(
        "--primary: oklch(0.5 0.2 300); the accent color is #E65A28"
      )
    ).toEqual([
      { colour: "oklch(0.5 0.2 300)", token: "primary" },
      { colour: "#E65A28", token: "accent" },
    ])
  })

  it("leaves a colour unnamed when no label sits right before it", () => {
    expect(
      readBrandColours("Create a preset where the main colour is #DE00CE")
    ).toEqual([{ colour: "#DE00CE", token: null }])
  })

  it("does not carry a label over to the next colour", () => {
    expect(readBrandColours("primary #254467, #E65A28")).toEqual([
      { colour: "#254467", token: "primary" },
      { colour: "#E65A28", token: null },
    ])
  })

  it("leaves out Pantone, which has no CSS value", () => {
    expect(readBrandColours("pantone 200 C and #0876BD")).toEqual([
      { colour: "#0876BD", token: null },
    ])
  })
})
