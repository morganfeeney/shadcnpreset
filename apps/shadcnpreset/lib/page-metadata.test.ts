import { describe, expect, it } from "vitest"

import { buildPageMetadata } from "@/lib/page-metadata"

describe("buildPageMetadata", () => {
  const base = {
    title: "What is a shadcn preset?",
    description: "A preset is a short code.",
    path: "/learn/what-is-a-shadcn-preset",
  }

  it("falls back to the static og card when no image is given", () => {
    const metadata = buildPageMetadata(base)

    expect(metadata.openGraph?.images).toBeDefined()
    expect(metadata.twitter?.images).toBeDefined()
  })

  it("omits images entirely for routes with their own opengraph-image", () => {
    const metadata = buildPageMetadata({ ...base, image: "route" })

    // Explicit entries would beat Next's file convention and ship the static
    // card instead of the generated one.
    expect(metadata.openGraph).not.toHaveProperty("images")
    expect(metadata.twitter).not.toHaveProperty("images")
    expect(metadata.openGraph?.title).toBe(base.title)
    expect(metadata.twitter).toMatchObject({ card: "summary_large_image" })
  })
})
