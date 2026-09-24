import { describe, expect, it } from "vitest"

import { knownBlocks, sectionsForKind } from "@/lib/page-builder/blocks"
import {
  buildPageQuestions,
  readPageFromJev,
  type PageBuilderAnswers,
} from "@/lib/page-builder/read-page"
import { LAYOUT_CATEGORIES, PAGE_SECTIONS } from "@/lib/page-builder/sections"
import { PAGE_BLOCK_VARIANTS } from "@/lib/page-builder/variants"

/**
 * Answers as Jev would send them: every section at `rest` unless given, and
 * each variant question favouring the variant named in `variants`, else the
 * section's first.
 */
function answersFor(
  kinds: Record<string, number>,
  sections: Record<string, number> = {},
  variants: Record<string, string> = {},
  rest = 0.1
): PageBuilderAnswers {
  const answers: PageBuilderAnswers = { page_kind: { probabilities: kinds } }
  for (const section of [
    ...PAGE_SECTIONS,
    ...Object.values(LAYOUT_CATEGORIES).flat(),
  ]) {
    const options = PAGE_BLOCK_VARIANTS[section.id] ?? []
    if (!options.length) continue
    answers[`section:${section.id}`] = { noul: sections[section.id] ?? rest }
    const favourite = variants[section.id] ?? options[0].id
    answers[`variant:${section.id}`] = {
      probabilities: Object.fromEntries(
        options.map((option) => [
          option.id,
          option.id === favourite ? 0.8 : 0.01,
        ])
      ),
    }
  }
  return answers
}

const ids = (reading: ReturnType<typeof readPageFromJev>) =>
  reading?.chosen.map((id) => id.replace(/-\d+$/, ""))

describe("buildPageQuestions", () => {
  it("asks whether each section belongs, except those always drafted", () => {
    const questions = buildPageQuestions()
    expect(questions["section:benefits"]).toBeDefined()
    expect(questions["section:hero"]).toBeUndefined()
  })

  it("asks for a variant only where there is a choice", () => {
    const questions = buildPageQuestions()
    expect(questions["variant:hero"]).toBeDefined()
    expect(questions["variant:win-rate"]).toBeUndefined()
  })

  it("asks which header, sidebar and footer, never whether", () => {
    const questions = buildPageQuestions()
    for (const id of [
      "top-navigation",
      "app-shell-header",
      "app-shell",
      "footer",
    ]) {
      expect(questions[`variant:${id}`]).toBeDefined()
      expect(questions[`section:${id}`]).toBeUndefined()
    }
  })
})

describe("readPageFromJev", () => {
  it("keeps only the chosen kind's sections", () => {
    const reading = readPageFromJev(
      answersFor(
        { marketing: 0.2, store: 0.7, dashboard: 0.1 },
        { "product-list": 0.9, checkout: 0.8, pricing: 0.99 }
      )
    )
    expect(reading?.kind).toBe("store")
    expect(reading?.kindProbability).toBe(0.7)
    // Pricing is marketing-only, however sure Jev is about it.
    expect(ids(reading)).toEqual(["product-list", "checkout"])
    expect(reading?.sections.map((s) => s.id)).toEqual(
      sectionsForKind("store").map((s) => s.id)
    )
  })

  it("uses the variant Jev favours", () => {
    const reading = readPageFromJev(
      answersFor(
        { marketing: 1 },
        { benefits: 0.9, cta: 0.9 },
        { hero: "hero-7", benefits: "benefits-4" }
      )
    )
    expect(reading?.chosen).toEqual(["hero-7", "benefits-4", "cta-1"])
    expect(reading?.sections[0].variants[0]).toMatchObject({ id: "hero-7" })
  })

  it("keeps page order, not probability order", () => {
    const reading = readPageFromJev(
      answersFor({ marketing: 1 }, { cta: 0.95, benefits: 0.6, faqs: 0.7 })
    )
    expect(ids(reading)).toEqual(["hero", "benefits", "faqs", "cta"])
  })

  it("falls back to the likeliest three when too few clear the bar", () => {
    const reading = readPageFromJev(
      answersFor(
        { marketing: 1 },
        { pricing: 0.45, benefits: 0.4, cta: 0.3, faqs: 0.6 }
      )
    )
    expect(ids(reading)).toEqual(["hero", "benefits", "pricing", "faqs"])
  })

  it("keeps a dashboard to its likeliest eight widgets, in page order", () => {
    const widgets = sectionsForKind("dashboard").map((s) => s.id)
    // Every widget clears the bar; later ones are likelier.
    const reading = readPageFromJev(
      answersFor(
        { dashboard: 1 },
        Object.fromEntries(widgets.map((id, i) => [id, 0.5 + i / 100]))
      )
    )
    expect(ids(reading)).toEqual(widgets.slice(-8))
  })

  it("frames a website with Jev's navigation and footer", () => {
    const reading = readPageFromJev(
      answersFor(
        { marketing: 1 },
        { benefits: 0.9 },
        { "top-navigation": "top-navigation-3", footer: "footer-2" }
      )
    )
    expect(reading?.layout).toEqual({
      header: "top-navigation-3",
      sidebar: null,
      footer: "footer-2",
    })
  })

  it("frames a dashboard with Jev's app shell and no footer", () => {
    const reading = readPageFromJev(
      answersFor(
        { dashboard: 1 },
        { "win-rate": 0.9 },
        { "app-shell": "app-shell-3", "app-shell-header": "app-shell-header-2" }
      )
    )
    expect(reading?.layout).toEqual({
      header: "app-shell-header-2",
      sidebar: "app-shell-3",
      footer: null,
    })
  })

  it("gives a single-variant section its only variant", () => {
    const reading = readPageFromJev(
      answersFor({ dashboard: 1 }, { "win-rate": 0.9, "metric-cards": 0.9 })
    )
    expect(reading?.chosen).toEqual(["metric-cards-1", "win-rate-1"])
  })

  it("ignores kinds the builder does not know", () => {
    const reading = readPageFromJev(answersFor({ blog: 0.9, dashboard: 0.1 }))
    expect(reading?.kind).toBe("dashboard")
  })

  it("is null when an answer the kind needs is missing", () => {
    const missingSection = answersFor({ dashboard: 1 })
    delete missingSection["section:win-rate"]
    expect(readPageFromJev(missingSection)).toBeNull()

    const missingVariant = answersFor({ marketing: 1 })
    delete missingVariant["variant:hero"]
    expect(readPageFromJev(missingVariant)).toBeNull()

    const missingLayout = answersFor({ marketing: 1 })
    delete missingLayout["variant:footer"]
    expect(readPageFromJev(missingLayout)).toBeNull()

    expect(readPageFromJev({})).toBeNull()
  })
})

describe("knownBlocks", () => {
  it("keeps the order given and repeats, across kinds, but no layout blocks", () => {
    expect(
      knownBlocks([
        "faqs-2",
        "win-rate-1",
        "product-list-3",
        "footer-2",
        "hero-99",
        "faqs-2",
      ])
    ).toEqual(["faqs-2", "win-rate-1", "product-list-3", "faqs-2"])
  })
})
