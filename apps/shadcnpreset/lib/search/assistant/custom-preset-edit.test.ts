import { describe, expect, it } from "vitest"

import { resolvePresetFromCode } from "@/lib/preset"
import {
  applyCustomPresetEdit,
  buildCustomPresetEditPrompt,
  editReply,
  fillNamedColours,
  tidyEditReply,
  withPresetParts,
  type CustomPresetEdit,
} from "@/lib/search/assistant/custom-preset-edit"

/** Nova, neutral base and theme. */
const CODE = "b0"
const CURRENT = {
  presetCode: CODE,
  colours: { theme: "#DE00CE", overrides: {} },
}

const NOTHING: CustomPresetEdit = {
  assistantMessage: "",
  style: null,
  font: null,
  fontHeading: null,
  iconLibrary: null,
  radius: null,
  baseColor: null,
  theme: null,
  chartColor: null,
  overrides: [],
  removeOverrides: [],
}

function apply(edit: Partial<CustomPresetEdit>) {
  return applyCustomPresetEdit(CURRENT, { ...NOTHING, ...edit })
}

describe("applyCustomPresetEdit", () => {
  it("changes nothing when nothing was asked for", () => {
    expect(apply({})).toEqual({ ...CURRENT, changed: [] })
  })

  it("takes a list theme, dropping the custom colour", () => {
    const result = apply({ theme: "Green" })

    expect(resolvePresetFromCode(result.presetCode)?.theme).toBe("green")
    expect(result.colours.theme).toBeUndefined()
    expect(result.changed).toEqual(["Theme: Green"])
  })

  it("takes an exact colour as the custom theme", () => {
    const result = apply({ theme: "oklch(0.6 0.15 150)" })

    expect(result.presetCode).toBe(CODE)
    expect(result.colours.theme).toBe("oklch(0.6 0.15 150)")
  })

  it("drops the 'custom' the model copies from the prompt", () => {
    const result = apply({ chartColor: "custom #22C55E" })

    expect(result.colours.chartColor).toBe("#22C55E")
    expect(result.changed).toEqual(["Chart Color: #22C55E"])
  })

  it("skips a colour it cannot use rather than guessing", () => {
    expect(apply({ theme: "forest-ish" }).changed).toEqual([])
    expect(apply({ baseColor: "pantone 200 C" }).changed).toEqual([])
  })

  it("changes the preset's other parts", () => {
    const result = apply({ style: "mira", radius: "large", font: "lora" })
    const preset = resolvePresetFromCode(result.presetCode)

    expect(preset?.style).toBe("mira")
    expect(preset?.radius).toBe("large")
    expect(preset?.font).toBe("lora")
    expect(result.colours.theme).toBe("#DE00CE")
  })

  it("sets and removes overrides", () => {
    const set = apply({
      overrides: [{ token: "background", colour: "#101418" }],
    })
    expect(set.colours.overrides).toEqual({ background: "#101418" })

    const removed = applyCustomPresetEdit(
      { presetCode: CODE, colours: set.colours },
      { ...NOTHING, removeOverrides: ["background"] }
    )
    expect(removed.colours.overrides).toEqual({})
  })
})

describe("withPresetParts", () => {
  it("takes the fonts and style but none of the colours", () => {
    const { presetCode: code, changed } = withPresetParts(CODE, {
      ...NOTHING,
      style: "mira",
      font: "raleway",
      fontHeading: "lora",
      theme: "green",
    })
    const preset = resolvePresetFromCode(code)

    expect(preset?.style).toBe("mira")
    expect(preset?.font).toBe("raleway")
    expect(preset?.fontHeading).toBe("lora")
    expect(preset?.theme).toBe("neutral")
    expect(changed).toEqual([
      "Style: Mira",
      "Font: Raleway",
      "Heading font: Lora",
    ])
  })
})

describe("fillNamedColours", () => {
  it("takes the colour its reply names when the field was left empty", () => {
    const edit = {
      ...NOTHING,
      assistantMessage: "Changed the Chart Color to #00BDDF.",
    }
    expect(
      fillNamedColours(edit, "now use this on the charts #00BDDF").chartColor
    ).toBe("#00BDDF")
  })

  it("reads a whole oklch colour, spaces and all", () => {
    const edit = {
      ...NOTHING,
      assistantMessage: "Changed the Chart Color to oklch(0.733 0.1371 24.94).",
    }
    expect(
      fillNamedColours(edit, "use this for charts oklch(0.733 0.1371 24.94)")
        .chartColor
    ).toBe("oklch(0.733 0.1371 24.94)")
  })

  it("takes a list name the person used", () => {
    const edit = {
      ...NOTHING,
      assistantMessage: "Changed the Chart Color to Red.",
    }
    expect(fillNamedColours(edit, "red charts").chartColor).toBe("Red")
  })

  it("makes nothing up that the person didn't say", () => {
    const edit = {
      ...NOTHING,
      assistantMessage: "Changed the Chart Color to #00BDDF.",
    }
    expect(fillNamedColours(edit, "make the charts blue").chartColor).toBeNull()
  })

  it("leaves a field the model set alone", () => {
    const edit = {
      ...NOTHING,
      chartColor: "#111111",
      assistantMessage: "Changed the Chart Color to #00BDDF.",
    }
    expect(fillNamedColours(edit, "#00BDDF charts").chartColor).toBe("#111111")
  })
})

describe("editReply", () => {
  it("says what changed, from the changes themselves", () => {
    expect(
      editReply(["Chart Color: #00BDDF", "Font: Lora"], {
        ...NOTHING,
        assistantMessage: "Done!",
      })
    ).toBe("Changed the Chart Color to #00BDDF and the Font to Lora.")
  })

  it("won't claim a change that didn't happen, whatever the verb", () => {
    for (const assistantMessage of [
      "Changed the Chart Color to #00BDDF.",
      "Added a red shadow to the cards.",
      "Please specify the shadow style or properties you'd like.",
    ]) {
      expect(editReply([], { ...NOTHING, assistantMessage })).toMatch(
        /^That isn’t something a custom preset can change/
      )
    }
  })

  it("keeps a question when nothing was asked to change", () => {
    expect(
      editReply([], {
        ...NOTHING,
        assistantMessage: "Which part, the theme or the charts?",
      })
    ).toBe("Which part, the theme or the charts?")
  })
})

describe("buildCustomPresetEditPrompt", () => {
  it("describes the preset as it is now", () => {
    const prompt = buildCustomPresetEditPrompt(CODE, CURRENT.colours)

    expect(prompt).toContain("- Theme: custom #DE00CE")
    expect(prompt).toContain("- Style: nova")
    expect(prompt).toContain("- Overrides: none")
  })
})

describe("tidyEditReply", () => {
  it("names changed values as the pickers show them", () => {
    expect(
      tidyEditReply("Changed the font to 'lora' and the theme to green.", {
        ...NOTHING,
        font: "lora",
        theme: "green",
      })
    ).toBe("Changed the font to Lora and the theme to Green.")
  })

  it("leaves exact colours and unchanged words alone", () => {
    expect(
      tidyEditReply("Set the theme to #1E3A8A, nothing else.", {
        ...NOTHING,
        theme: "#1E3A8A",
      })
    ).toBe("Set the theme to #1E3A8A, nothing else.")
  })
})
