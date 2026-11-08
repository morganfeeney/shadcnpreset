// @vitest-environment jsdom
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { AssistantConversation } from "@/components/assistant/assistant-conversation"

describe("AssistantConversation replies", () => {
  it("show each colour they name with a swatch of it", async () => {
    const { container } = render(
      <AssistantConversation
        pending={false}
        renderPresets={() => null}
        messages={[
          { role: "user", content: "Use #1D4ED8" },
          {
            role: "assistant",
            kind: "text",
            content: "Changed the primary to #1D4ED8.",
          },
        ]}
      />
    )

    await screen.findByText("Changed the primary to", { exact: false })
    const swatches = [
      ...container.querySelectorAll<HTMLElement>("code span[aria-hidden]"),
    ]
    expect(swatches.map((swatch) => swatch.style.background)).toEqual([
      "rgb(29, 78, 216)",
    ])
  })
})
