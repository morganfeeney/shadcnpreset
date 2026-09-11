import { describe, expect, it } from "vitest"

import { GENERATED_PREVIEW_COMPONENT_NAMES } from "@/lib/generated-preview/catalog"
import { inferPreviewLayout } from "@/lib/generated-preview/infer-layout"
import { PREVIEW_CASES } from "@/lib/generated-preview/preview-corpus"
import { validateGeneratedPreviewSource } from "@/lib/generated-preview/validate"

const broken = PREVIEW_CASES.filter((testCase) => testCase.issue)
const sound = PREVIEW_CASES.filter((testCase) => !testCase.issue)
const placed = PREVIEW_CASES.filter((testCase) => testCase.layout)

describe("previews that went wrong", () => {
  it.each(broken.map((testCase) => [testCase.name, testCase] as const))(
    "%s",
    (_name, testCase) => {
      const result = validateGeneratedPreviewSource(
        testCase.code,
        GENERATED_PREVIEW_COMPONENT_NAMES
      )

      if (result.ok) {
        throw new Error(
          `expected ${testCase.issue}, but this passed every check`
        )
      }

      // Naming the check matters as much as failing: a case that starts
      // tripping a different rule has moved, and moving is worth knowing
      // about even when it is still caught.
      expect(result[testCase.issue!], result.error).toBeTruthy()
    }
  )
})

describe("previews that are sound", () => {
  it.each(sound.map((testCase) => [testCase.name, testCase] as const))(
    "%s",
    (_name, testCase) => {
      const result = validateGeneratedPreviewSource(
        testCase.code,
        GENERATED_PREVIEW_COMPONENT_NAMES
      )

      // The half that stops a rule from growing teeth it should not have.
      // Every check here fires on markup someone would reasonably write.
      if (!result.ok) throw new Error(result.error)
      expect(result.ok).toBe(true)
    }
  )
})

describe("where the canvas puts them", () => {
  it.each(placed.map((testCase) => [testCase.name, testCase] as const))(
    "%s",
    (_name, testCase) => {
      expect(inferPreviewLayout(testCase.code)).toBe(testCase.layout)
    }
  )
})
