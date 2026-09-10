import { describe, expect, it } from "vitest"

import { buildAssistantSystemPrompt } from "@/lib/search/assistant/system-prompt"

/**
 * The two branches must not contradict each other. Telling the model both
 * "never gather for a show request" and "never use preview" left it no legal
 * phase, so it emitted a preview with empty code, which normalises to null and
 * surfaces as "Assistant returned an incomplete answer".
 */
describe("buildAssistantSystemPrompt", () => {
  it("routes show requests to preview when a preset is available", () => {
    const prompt = buildAssistantSystemPrompt({ canPreview: true })

    expect(prompt).toContain("## Phase: preview")
    expect(prompt).toContain("Go straight to preview")
    expect(prompt).not.toContain('Never use phase "preview"')
  })

  it("forbids preview without a preset, and does not also forbid gathering", () => {
    const prompt = buildAssistantSystemPrompt({ canPreview: false })

    expect(prompt).toContain('Never use phase "preview"')
    expect(prompt).not.toContain("## Phase: preview")
    // Leaving this in would close off the only remaining phase.
    expect(prompt).not.toContain("Go straight to preview")
  })

  it("defaults to no preview", () => {
    expect(buildAssistantSystemPrompt()).toContain('Never use phase "preview"')
  })

  it("lists component names and their variant enums when previewing", () => {
    const prompt = buildAssistantSystemPrompt({ canPreview: true })

    expect(prompt).toContain("DrawerContent")
    expect(prompt).toContain("Button: variant=")
    expect(prompt).toContain("icon-lg")
  })
})
