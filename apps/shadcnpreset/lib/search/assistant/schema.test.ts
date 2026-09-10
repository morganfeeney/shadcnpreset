import { describe, expect, it } from "vitest"

import { normalizeAssistantTurn } from "@/lib/search/assistant/schema"

const variant = {
  style: "nova",
  baseColor: "neutral",
  theme: "blue",
  chartColor: "blue",
  iconLibrary: "lucide",
  font: "inter",
  fontHeading: "inter",
  radius: "default",
  menuAccent: "subtle",
  menuColor: "default",
  caption: "Calm product UI",
} as const

describe("normalizeAssistantTurn preview", () => {
  it("accepts a preview phase with JSX", () => {
    const result = normalizeAssistantTurn({
      phase: "preview",
      assistantMessage: "Showing a date picker with this preset.",
      followUpQuestions: [],
      presetVariants: [],
      previewTitle: "Date picker",
      previewCode: "function Preview() { return <DatePicker /> }",
    })

    expect(result).toEqual({
      phase: "preview",
      assistantMessage: "Showing a date picker with this preset.",
      preview: {
        title: "Date picker",
        code: "function Preview() { return <DatePicker /> }",
      },
    })
  })

  it("rejects preview without code", () => {
    const result = normalizeAssistantTurn({
      phase: "preview",
      assistantMessage: "Showing a date picker with this preset.",
      followUpQuestions: [],
      presetVariants: [],
      previewTitle: "Date picker",
      previewCode: "   ",
    })
    expect(result).toBeNull()
  })

  it("still accepts ready turns", () => {
    const result = normalizeAssistantTurn({
      phase: "ready",
      assistantMessage: 'Here are four presets matching the phrase "calm".',
      followUpQuestions: [],
      presetVariants: [variant],
      previewTitle: "",
      previewCode: "",
    })
    expect(result?.phase).toBe("ready")
  })
})
