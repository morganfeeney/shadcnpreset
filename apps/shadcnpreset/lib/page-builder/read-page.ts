import { isPageKind, sectionsForKind } from "@/lib/page-builder/blocks"
import {
  KIND_LAYOUT,
  LAYOUT_CATEGORIES,
  LAYOUT_SLOTS,
  PAGE_KIND_DESCRIPTIONS,
  PAGE_SECTIONS,
  type PageKind,
  type PageLayout,
} from "@/lib/page-builder/sections"
import { PAGE_BLOCK_VARIANTS } from "@/lib/page-builder/variants"

const KIND_QUESTION = "page_kind"
const SECTION_QUESTION_PREFIX = "section:"
const VARIANT_QUESTION_PREFIX = "variant:"

/** A section Jev gives an even chance or better goes on the page. */
const INCLUDE_AT = 0.5
/**
 * A page needs something between its header and footer. When Jev clears too
 * few sections — "a site for my bakery" names none — its likeliest few stand in.
 */
const MIN_SECTIONS = 2
const FALLBACK_SECTIONS = 3
/**
 * Most analytics widgets sound plausible on any dashboard, so Jev clears far
 * more than fit on one screen. Its likeliest eight make the page.
 */
const MAX_SECTIONS: Partial<Record<PageKind, number>> = { dashboard: 8 }

export type PageBuilderAnswers = Record<
  string,
  { probabilities?: Record<string, number>; noul?: number } | undefined
>

export type PageVariantReading = {
  id: string
  title: string
  /** Jev's probability that this variant suits the page best. */
  probability: number
}

export type PageSectionReading = {
  id: string
  label: string
  /** In every draft; only its variant is a judgment. */
  always: boolean
  /** Jev's probability that the page includes this section; 1 if always. */
  probability: number
  included: boolean
  /** Likeliest first. A single-variant section has one, at 1. */
  variants: PageVariantReading[]
}

export type PageReading = {
  kind: PageKind
  kindProbability: number
  /** Every section the kind allows, in page order. */
  sections: PageSectionReading[]
  /** The block Jev put on the page for each included section, in page order. */
  chosen: string[]
  /** The header, sidebar and footer around the blocks. */
  layout: PageLayout
}

function variantQuestion(label: string, sectionId: string) {
  return {
    type: "choice",
    instructions: {
      section: label,
      question:
        "Which design of the `section` section best suits the page described by `description` — its purpose, audience, content and mood?",
    },
    criteria: variantCriteria(sectionId),
  }
}

function variantCriteria(sectionId: string) {
  return Object.fromEntries(
    PAGE_BLOCK_VARIANTS[sectionId].map((variant) => [
      variant.id,
      variant.description
        ? `${variant.title}. ${variant.description}`
        : variant.title,
    ])
  )
}

/**
 * One Choice for the kind of page; for every section of every kind, a Noul
 * for whether the page has it and a Choice between its variants; and a
 * Choice between the variants of every header, sidebar and footer.
 *
 * All but the kind question are speculative: they run alongside it rather
 * than after it, and only the chosen kind's answers are read. That costs
 * tokens but not a second round trip.
 */
export function buildPageQuestions() {
  const questions: Record<string, unknown> = {
    [KIND_QUESTION]: {
      type: "choice",
      instructions:
        "What kind of page is `description` asking to be built? If it only describes a business or brand, pick the page that business would most likely want.",
      criteria: PAGE_KIND_DESCRIPTIONS,
    },
  }

  for (const section of PAGE_SECTIONS) {
    const variants = PAGE_BLOCK_VARIANTS[section.id]
    if (!variants?.length) continue

    if (!section.always) {
      questions[`${SECTION_QUESTION_PREFIX}${section.id}`] = {
        type: "noul",
        instructions: {
          section: section.shows ?? section.label,
          question:
            "Would a good version of the page described by `description` include a section showing `section`?",
        },
        criteria: {
          true: "The description asks for it, or a page for this purpose and audience would normally have it",
          false:
            "The description does not ask for it and it would be unnecessary or out of place on this page",
        },
      }
    }

    if (variants.length > 1) {
      questions[`${VARIANT_QUESTION_PREFIX}${section.id}`] = variantQuestion(
        section.label,
        section.id
      )
    }
  }

  for (const category of Object.values(LAYOUT_CATEGORIES).flat()) {
    if ((PAGE_BLOCK_VARIANTS[category.id]?.length ?? 0) > 1) {
      questions[`${VARIANT_QUESTION_PREFIX}${category.id}`] = variantQuestion(
        category.label,
        category.id
      )
    }
  }

  return questions
}

function readVariants(
  sectionId: string,
  answers: PageBuilderAnswers
): PageVariantReading[] | null {
  const variants = PAGE_BLOCK_VARIANTS[sectionId]
  if (variants.length === 1) {
    return [{ id: variants[0].id, title: variants[0].title, probability: 1 }]
  }
  const probabilities =
    answers[`${VARIANT_QUESTION_PREFIX}${sectionId}`]?.probabilities
  if (!probabilities) return null
  return variants
    .map((variant) => ({
      id: variant.id,
      title: variant.title,
      probability: probabilities[variant.id] ?? 0,
    }))
    .sort((a, b) => b.probability - a.probability)
}

/**
 * Turns one System One response into the page it describes: a kind, that
 * kind's sections in page order with the variant each should use, and the
 * header, sidebar and footer around them. Null when the response is missing
 * answers.
 */
export function readPageFromJev(
  answers: PageBuilderAnswers
): PageReading | null {
  const kinds = answers[KIND_QUESTION]?.probabilities
  if (!kinds) return null

  const [kind, kindProbability] =
    Object.entries(kinds)
      .filter((entry): entry is [PageKind, number] => isPageKind(entry[0]))
      .sort((a, b) => b[1] - a[1])[0] ?? []
  if (!kind || kindProbability === undefined) return null

  const sections: PageSectionReading[] = []
  for (const section of sectionsForKind(kind)) {
    const variants = readVariants(section.id, answers)
    const probability = section.always
      ? 1
      : answers[`${SECTION_QUESTION_PREFIX}${section.id}`]?.noul
    if (!variants || typeof probability !== "number") return null
    sections.push({
      id: section.id,
      label: section.label,
      always: Boolean(section.always),
      probability,
      included: section.always || probability >= INCLUDE_AT,
      variants,
    })
  }

  const body = sections.filter((section) => !section.always)
  const byLikelihood = [...body].sort((a, b) => b.probability - a.probability)
  const includedCount = body.filter((section) => section.included).length
  const max = MAX_SECTIONS[kind] ?? Infinity
  if (includedCount < MIN_SECTIONS || includedCount > max) {
    const keep = new Set(
      includedCount < MIN_SECTIONS
        ? byLikelihood.slice(0, FALLBACK_SECTIONS)
        : byLikelihood.filter((section) => section.included).slice(0, max)
    )
    for (const section of body) section.included = keep.has(section)
  }

  const layout = {} as PageLayout
  for (const slot of LAYOUT_SLOTS) {
    const category = KIND_LAYOUT[kind][slot]
    if (!category || !PAGE_BLOCK_VARIANTS[category]?.length) {
      layout[slot] = null
      continue
    }
    const variants = readVariants(category, answers)
    if (!variants) return null
    layout[slot] = variants[0].id
  }

  return {
    kind,
    kindProbability,
    sections,
    layout,
    chosen: sections
      .filter((section) => section.included)
      .map((section) => section.variants[0].id),
  }
}
