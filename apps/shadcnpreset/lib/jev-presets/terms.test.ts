import { describe, expect, it } from "vitest"

import { extractNamedTerms } from "@/lib/jev-presets/terms"

describe("extractNamedTerms", () => {
  it("takes a style named outright, whatever else the description says", () => {
    // "sera tight" came back Mira: the mood word beat the name.
    expect(extractNamedTerms("sera tight").style).toBe("sera")
    expect(extractNamedTerms("funky rhea pink charts").style).toBe("rhea")
  })

  it("takes a named icon set", () => {
    expect(extractNamedTerms("phosphor icons").iconLibrary).toBe("phosphor")
    expect(extractNamedTerms("dark app with Tabler").iconLibrary).toBe("tabler")
  })

  it("reads a font written with a space or a hyphen", () => {
    expect(extractNamedTerms("jetbrains mono").font).toBe("jetbrains-mono")
    expect(extractNamedTerms("jetbrains-mono").font).toBe("jetbrains-mono")
    expect(extractNamedTerms("set in EB Garamond").font).toBe("eb-garamond")
  })

  it("ties a font to headings or body when the description says so", () => {
    const terms = extractNamedTerms("playfair display headings")

    expect(terms.fontHeading).toBe("playfair-display")
    expect(terms.font).toBeUndefined()
  })

  it("treats an unqualified font as the body font", () => {
    expect(extractNamedTerms("montserrat").font).toBe("montserrat")
  })

  it("ignores font names that are ordinary words without typography context", () => {
    // An outfit store is not a request for the Outfit typeface.
    expect(extractNamedTerms("outfit store for teens").font).toBeUndefined()
    expect(extractNamedTerms("outfit font").font).toBe("outfit")
    expect(extractNamedTerms("inter font").font).toBe("inter")
  })

  it("finds nothing in a description that names nothing", () => {
    expect(extractNamedTerms("cosy coffee shop")).toEqual({
      style: undefined,
      iconLibrary: undefined,
    })
  })
})
