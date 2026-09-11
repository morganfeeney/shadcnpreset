import { describe, expect, it } from "vitest"

import { buildAssistantSystemPrompt } from "@/lib/search/assistant/system-prompt"

describe("buildAssistantSystemPrompt", () => {
  /**
   * A show request must reach the preview phase. It previously fell through to
   * gathering, asked which style the user wanted, and answered with four
   * presets — the component never appeared.
   */
  it("routes show requests straight to preview", () => {
    const prompt = buildAssistantSystemPrompt()

    expect(prompt).toContain("## Phase: preview")
    expect(prompt).toContain("Never use gathering for a show/display/render request")
    expect(prompt).toContain("Go straight to preview")
  })

  it("never tells the model previews are unavailable", () => {
    // A preset is always resolved by the route, so there is no such state.
    const prompt = buildAssistantSystemPrompt()

    expect(prompt).not.toContain('Never use phase "preview"')
    expect(prompt).not.toContain("## Component demos")
  })

  it("lists component names and their variant enums", () => {
    const prompt = buildAssistantSystemPrompt()

    expect(prompt).toContain("DrawerContent")
    expect(prompt).toContain("Button: variant=")
    expect(prompt).toContain("icon-lg")
  })

  it("leaves layout to the frame", () => {
    expect(buildAssistantSystemPrompt()).toContain("Layout is not your concern")
  })
})
