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

describe("extractNamedTerms: colours tied to a part of the preset", () => {
  it("reads a colour named for the charts and one named for the theme", () => {
    expect(extractNamedTerms("blue charts green theme")).toMatchObject({
      chartColor: "blue",
      theme: "green",
    })
  })

  it("holds up when other words come first", () => {
    // This came back swapped when Jev read the sentence.
    expect(
      extractNamedTerms("phosphor icons with jetbrains mono blue charts green theme")
    ).toMatchObject({
      iconLibrary: "phosphor",
      font: "jetbrains-mono",
      chartColor: "blue",
      theme: "green",
    })
  })

  it("reads the other word order too", () => {
    expect(extractNamedTerms("charts are green, theme is blue")).toMatchObject({
      chartColor: "green",
      theme: "blue",
    })
  })

  it("takes accent, primary and brand as the theme", () => {
    expect(extractNamedTerms("red accent").theme).toBe("red")
    expect(extractNamedTerms("brand colour is teal").theme).toBe("teal")
  })

  it("leaves a colour with nothing to attach it to for Jev", () => {
    const terms = extractNamedTerms("something pink and playful")

    expect(terms.theme).toBeUndefined()
    expect(terms.chartColor).toBeUndefined()
  })
})

describe("extractNamedTerms: one colour word belongs to one field", () => {
  it("does not let the accent take the colour the charts already had", () => {
    // Without punctuation "green theme" also reads as a phrase here.
    expect(extractNamedTerms("charts are green theme is blue")).toMatchObject({
      chartColor: "green",
      theme: "blue",
    })
  })
})

describe("extractNamedTerms: corner words", () => {
  it.each([
    "tight corners",
    "sharp corners",
    "square corners",
    "no corners",
    "no rounding",
    "zero radius",
    "corners are tight",
    "brutalist",
  ])("reads %s as no rounding", (description) => {
    expect(extractNamedTerms(description).radius).toBe("none")
  })

  it("reads the rounded end too", () => {
    expect(extractNamedTerms("pill shaped buttons").radius).toBe("large")
    expect(extractNamedTerms("very rounded cards").radius).toBe("large")
    expect(extractNamedTerms("slightly rounded").radius).toBe("small")
  })

  it("leaves vaguer words to Jev", () => {
    expect(extractNamedTerms("soft friendly cards").radius).toBeUndefined()
    expect(extractNamedTerms("cosy coffee shop").radius).toBeUndefined()
  })
})
