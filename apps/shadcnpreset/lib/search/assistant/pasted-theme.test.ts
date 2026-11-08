import { describe, expect, it } from "vitest"

import { applyCustomPresetEdit } from "@/lib/search/assistant/custom-preset-edit"
import {
  pastedThemeReply,
  readPastedTheme,
} from "@/lib/search/assistant/pasted-theme"

const OPEN = { presetCode: "b0", colours: { overrides: {} } }

function paste(css: string) {
  const pasted = readPastedTheme(css)
  if (!pasted) throw new Error("not read as a pasted theme")
  const next = applyCustomPresetEdit(OPEN, pasted.edit)
  return { pasted, next, reply: pastedThemeReply(next.changed, pasted) }
}

describe("readPastedTheme", () => {
  it("is not a message that only mentions a property", () => {
    expect(readPastedTheme("make --primary teal")).toBeNull()
    expect(readPastedTheme("Warm and earthy, for a coffee roaster")).toBeNull()
  })

  it("takes each colour as written", () => {
    const { next, reply } = paste(`:root {
      --primary: #1D4ED8;
      --primary-foreground: #FFFFFF;
      --background: #FAFAF9;
    }`)

    expect(next.colours.overrides).toEqual({
      primary: "#1D4ED8",
      "primary-foreground": "#FFFFFF",
      background: "#FAFAF9",
    })
    expect(reply).toBe(
      "Changed the primary to #1D4ED8, the background to #FAFAF9 and the primary-foreground to #FFFFFF."
    )
  })

  it("takes the light values, and says the dark ones were not used", () => {
    const { next, reply } =
      paste(`:root { --primary: oklch(0.55 0.16 45); --background: oklch(0.99 0.004 85); }
      .dark { --primary: oklch(0.7 0.15 50); --background: oklch(0.18 0.015 60); }`)

    expect(next.colours.overrides.primary).toBe("oklch(0.55 0.16 45)")
    expect(next.colours.overrides.background).toBe("oklch(0.99 0.004 85)")
    expect(reply).toContain("The .dark values weren’t used")
  })

  it("reads older themes' bare HSL numbers", () => {
    const { next } = paste(
      `:root { --primary: 262 83% 58%; --background: 0 0% 100%; }`
    )

    expect(next.colours.overrides.primary).toBe("hsl(262 83% 58%)")
  })

  it("follows var() to the colour it names", () => {
    const { next, pasted } =
      paste(`@theme inline { --color-brand-500: #E11D48; }
      :root { --primary: var(--color-brand-500); --foreground: hsl(240 10% 4%); }`)

    expect(next.colours.overrides.primary).toBe("#E11D48")
    expect(pasted.leftOut).toEqual([])
  })

  it("sets what it can, and says why the rest isn't", () => {
    const { next, reply } = paste(`:root {
      --primary: #0F766E;
      --destructive: #DC2626;
      --ring: #14B8A6;
      --input: #D4D4D8;
      --popover: #FFFFFF;
      --chart-1: #0F766E;
      --chart-2: #F59E0B;
      --sidebar: #F4F4F5;
      --radius: 0.25rem;
      --font-sans: "Lora", serif;
      --shadow-md: 0 4px 12px rgb(0 0 0 / 0.08);
      --tracking-normal: -0.01em;
    }`)

    expect(next.colours.overrides).toEqual({
      primary: "#0F766E",
      destructive: "#DC2626",
      ring: "#14B8A6",
      "chart-1": "#0F766E",
      "chart-2": "#F59E0B",
    })
    expect(next.changed).toEqual(
      expect.arrayContaining(["Radius: Small", "Font: Lora"])
    )
    expect(reply).toContain(
      "`--input`, `--popover` and `--sidebar` take their colour from border, card and background, so their own weren’t used."
    )
    expect(reply).toContain(
      "A preset has no setting for `--shadow-md` and `--tracking-normal`."
    )
  })
})
