import { describe, expect, it } from "vitest"

import { toPersistedAssistantMessage } from "@/lib/search/assistant/message-persistence"

describe("toPersistedAssistantMessage", () => {
  it("keeps user messages as text", () => {
    const result = toPersistedAssistantMessage({
      role: "user",
      content: "old fashioned style",
    })

    expect(result).toEqual({
      role: "user",
      kind: "text",
      content: "old fashioned style",
    })
  })

  it("preserves assistant preset cards", () => {
    const result = toPersistedAssistantMessage({
      role: "assistant",
      kind: "presets",
      content: "Here are four presets.",
      presets: [
        { code: "a1", caption: "A", description: "first" },
        { code: "a2", caption: "B", description: "second" },
      ],
    })

    expect(result.kind).toBe("presets")
    expect(result.presets).toHaveLength(2)
    expect(result.presets?.[0]?.code).toBe("a1")
  })

  it("normalizes assistant text follow-up questions", () => {
    const result = toPersistedAssistantMessage({
      role: "assistant",
      kind: "text",
      content: "Choose one direction.",
      followUpQuestions: [
        " Serif-forward · muted palette ",
        "",
        "Sans-forward · vibrant palette",
      ],
    })

    expect(result).toEqual({
      role: "assistant",
      kind: "text",
      content: "Choose one direction.",
      followUpQuestions: [
        "Serif-forward · muted palette",
        "Sans-forward · vibrant palette",
      ],
    })
  })

  it("falls back to text when presets are missing", () => {
    const result = toPersistedAssistantMessage({
      role: "assistant",
      kind: "presets",
      content: "Here are presets.",
      presets: [],
    })

    expect(result.kind).toBe("text")
    expect(result.presets).toBeUndefined()
  })

  it("preserves generated preview payloads", () => {
    const result = toPersistedAssistantMessage({
      role: "assistant",
      kind: "preview",
      content: "Showing a date picker.",
      preview: {
        title: "Date picker",
        code: "function Preview() { return <DatePicker /> }",
        presetCode: "b5aFUJkSzC",
      },
    })

    expect(result).toEqual({
      role: "assistant",
      kind: "preview",
      content: "Showing a date picker.",
      preview: {
        title: "Date picker",
        code: "function Preview() { return <DatePicker /> }",
        presetCode: "b5aFUJkSzC",
      },
    })
  })

  it("omits an absent preset code rather than storing undefined", () => {
    const result = toPersistedAssistantMessage({
      role: "assistant",
      kind: "preview",
      content: "Showing a date picker.",
      preview: {
        title: "Date picker",
        code: "function Preview() { return <DatePicker /> }",
      },
    })

    expect(result.preview).toEqual({
      title: "Date picker",
      code: "function Preview() { return <DatePicker /> }",
    })
    expect(result.preview && "presetCode" in result.preview).toBe(false)
  })

  it("falls back to text when the preview payload is malformed", () => {
    const result = toPersistedAssistantMessage({
      role: "assistant",
      kind: "preview",
      content: "Showing a date picker.",
      preview: { title: "Date picker", code: "   " },
    })

    expect(result.kind).toBe("text")
    expect(result.preview).toBeUndefined()
  })
})
