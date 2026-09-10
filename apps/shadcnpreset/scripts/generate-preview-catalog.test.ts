import { describe, expect, it } from "vitest"

import { extractVariants } from "@/scripts/generate-preview-catalog"

const source = (body: string) => [{ name: "x.tsx", source: body }]

describe("extractVariants", () => {
  it("reads the multi-line cva form", () => {
    expect(
      extractVariants(
        source(`const buttonVariants = cva(
  "base",
  {
    variants: {
      variant: {
        default: "a",
        outline: "b",
      },
    },
  }
)`)
      )
    ).toEqual({ Button: { variant: ["default", "outline"] } })
  })

  it("reads the single-line cva form", () => {
    // Field writes `cva("base", {`, indenting its keys two spaces less. A fixed
    // indent missed it, so Field's `orientation` never reached the prompt and a
    // checkbox kept being stretched full width above its label.
    expect(
      extractVariants(
        source(`const fieldVariants = cva("cn-field flex w-full", {
  variants: {
    orientation: {
      vertical: "flex-col",
      horizontal: "flex-row",
    },
  },
})`)
      )
    ).toEqual({ Field: { orientation: ["vertical", "horizontal"] } })
  })

  it("keeps quoted keys", () => {
    expect(
      extractVariants(
        source(`const buttonVariants = cva("b", {
  variants: {
    size: {
      default: "a",
      "icon-lg": "c",
    },
  },
})`)
      )
    ).toEqual({ Button: { size: ["default", "icon-lg"] } })
  })

  it("ignores colons inside class strings", () => {
    // `@md/field-group:flex-row` used to parse as a variant group.
    expect(
      extractVariants(
        source(`const cardVariants = cva("x", {
  variants: {
    tone: {
      muted: "@md/field-group:flex-row hover:bg-muted",
    },
  },
})`)
      )
    ).toEqual({ Card: { tone: ["muted"] } })
  })
})
