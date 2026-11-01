// @vitest-environment jsdom
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("@/lib/analytics-events", () => ({ trackEvent: vi.fn() }))
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }))
// The preview cards load fonts at import, which only Next's compiler can
// do; they are the site's own and never render here (no mode yet).
vi.mock(
  "@/components/preset-swatch/components/cards/claimable-balance",
  () => ({
    ClaimableBalance: () => null,
  })
)
vi.mock("@/components/preset-swatch/components/cards/feedback-form", () => ({
  FeedbackForm: () => null,
}))
vi.mock(
  "@/components/preset-swatch/components/cards/observability-card",
  () => ({
    ObservabilityCard: () => null,
  })
)
vi.mock("@/components/preset-swatch/components/cards/pie-chart-card", () => ({
  PieChartCard: () => null,
}))
vi.mock(
  "@/components/preset-swatch/components/cards/preview-analytics-card",
  () => ({
    PreviewAnalyticsCard: () => null,
  })
)
vi.mock("@/components/preset-swatch/components/cards/savings-progress", () => ({
  SavingsProgress: () => null,
}))
vi.mock("@/components/preset-swatch/components/cards/ui-elements", () => ({
  UIElements: () => null,
}))
// The preview cards are the site's own; this file is about the facets.
let surfaceMode: "light" | "dark" | null = null
vi.mock("@/components/themes/theme-surface", () => ({
  useSurfaceMode: () => surfaceMode,
}))

const { toast } = await import("sonner")
const { withFacet } = await import("@/lib/custom-preset")
const { CustomPresetEditor } =
  await import("@/components/custom-presets/custom-preset-editor")

/** Luma, Figtree, Lucide. */
const CODE = "b5dyaqxe6"
const COLOURS = { theme: "#DE00CE", overrides: {} }

let respond: () => Response

beforeEach(() => {
  surfaceMode = null
  vi.mocked(toast.error).mockClear()
  respond = () => new Response("{}", { status: 200 })
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => respond())
  )
})

function renderEditor(canEdit = true, code = CODE) {
  return render(
    <CustomPresetEditor
      id="cp-1"
      initialCode={code}
      colours={COLOURS}
      canEdit={canEdit}
      origin="https://shadcnpreset.com"
    />
  )
}

async function pickStyle(name: string) {
  await pick("Style", name)
}

async function pick(facet: string, name: string) {
  fireEvent.click(screen.getByRole("combobox", { name: facet }))
  const option = await screen.findByRole("option", { name })
  // Base UI picks on pointer up, as a real click delivers it.
  await act(async () => {
    fireEvent.pointerDown(option, { pointerType: "mouse" })
    fireEvent.pointerUp(option, { pointerType: "mouse" })
    fireEvent.click(option)
  })
}

function installCommands() {
  return screen.getAllByText(/npx shadcn@/).map((node) => node.textContent)
}

describe("CustomPresetEditor", () => {
  it("installs the preset, then the colours from its own link", () => {
    renderEditor()

    expect(installCommands()).toEqual(
      expect.arrayContaining([
        `npx shadcn@latest init --preset ${CODE}`,
        "npx shadcn@latest add https://shadcnpreset.com/r/custom/cp-1.json",
      ])
    )
  })

  it("saves a changed facet and installs the new preset", async () => {
    renderEditor()

    await pickStyle("Nova")

    expect(fetch).toHaveBeenCalledWith(
      "/api/custom-presets/cp-1",
      expect.objectContaining({ method: "PATCH" })
    )
    const sent = JSON.parse(
      String(vi.mocked(fetch).mock.calls[0][1]?.body)
    ) as { presetCode: string }
    expect(sent.presetCode).not.toBe(CODE)
    expect(installCommands()).toContain(
      `npx shadcn@latest init --preset ${sent.presetCode}`
    )
  })

  it("goes back to the saved preset when a change does not save", async () => {
    respond = () => new Response("{}", { status: 500 })
    renderEditor()

    await pickStyle("Nova")

    await waitFor(() => expect(toast.error).toHaveBeenCalled())
    expect(installCommands()).toContain(
      `npx shadcn@latest init --preset ${CODE}`
    )
  })

  it("lets only the person who made it change it", () => {
    renderEditor(false)

    expect(
      screen
        .getByRole("combobox", { name: "Style" })
        .hasAttribute("disabled") ||
        screen
          .getByRole("combobox", { name: "Style" })
          .getAttribute("aria-disabled") === "true" ||
        screen
          .getByRole("combobox", { name: "Style" })
          .hasAttribute("data-disabled")
    ).toBe(true)
    expect(
      screen.getByText("Only the person who made this preset can change it.")
    ).toBeTruthy()
  })

  it("redraws the preview with a picked radius", async () => {
    surfaceMode = "light"
    renderEditor()
    const preview = screen.getByRole("region", {
      name: "Your custom preset on example components",
    }).parentElement as HTMLElement
    const before = preview.style.getPropertyValue("--radius")

    await pick("Radius", "Large")

    expect(preview.style.getPropertyValue("--radius")).toBe("0.875rem")
    expect(before).not.toBe("0.875rem")
  })

  it("locks the radius on Lyra, which is always square", () => {
    renderEditor(true, withFacet(CODE, "style", "lyra")!)

    const radius = screen.getByRole("combobox", { name: "Radius" })
    expect(radius.textContent).toContain("None")
    expect(
      radius.hasAttribute("disabled") || radius.hasAttribute("data-disabled")
    ).toBe(true)
    expect(screen.getByText(/Lyra is always square/)).toBeTruthy()
  })

  it("shows a custom theme colour as Custom, with its value", () => {
    renderEditor()

    expect(
      screen.getByRole("combobox", { name: "Theme" }).textContent
    ).toContain("Custom")
    expect(
      (
        screen.getByRole("textbox", {
          name: "Theme colour",
        }) as HTMLInputElement
      ).value
    ).toBe("#DE00CE")
  })

  it("saves an exact theme colour typed in, and puts it in the CSS", async () => {
    renderEditor()

    await typeColour("Theme colour", "oklch(0.6 0.2 150)")

    expect(sentColours()).toEqual({
      theme: "oklch(0.6 0.2 150)",
      overrides: {},
    })
    expect(cssText()).toContain("--primary: oklch(0.6 0.2 150);")
  })

  it("keeps the colour when what's typed isn't one", async () => {
    renderEditor()

    await typeColour("Theme colour", "not a colour")

    expect(fetch).not.toHaveBeenCalled()
    expect(
      (
        screen.getByRole("textbox", {
          name: "Theme colour",
        }) as HTMLInputElement
      ).value
    ).toBe("#DE00CE")
  })

  it("goes back to a list theme, dropping the custom colour", async () => {
    renderEditor()

    await pick("Theme", "Blue")

    expect(sentColours()).toEqual({ overrides: {} })
    expect(screen.queryByRole("textbox", { name: "Theme colour" })).toBeNull()
    expect(sentCode()).toBe(withFacet(CODE, "theme", "blue"))
  })

  it("starts a custom base colour from the picker's own", async () => {
    renderEditor()

    await pick("Base Color", "Custom")

    const base = (sentColours() as { baseColor?: string }).baseColor
    expect(base).toEqual(expect.any(String))
    expect(
      (
        screen.getByRole("textbox", {
          name: "Base Color colour",
        }) as HTMLInputElement
      ).value
    ).toBe(base)
  })

  it("overrides a single colour on top of the pickers", async () => {
    renderEditor()

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Override a colour" }))
    })
    await typeColour("Primary colour", "#123456")

    expect(sentColours()).toEqual({
      theme: "#DE00CE",
      overrides: { primary: "#123456" },
    })
    expect(cssText()).toContain("--primary: #123456;")
  })

  it("goes back to the saved colour when a change does not save", async () => {
    respond = () => new Response("{}", { status: 500 })
    renderEditor()

    await typeColour("Theme colour", "#00FF00")

    await waitFor(() => expect(toast.error).toHaveBeenCalled())
    expect(
      (
        screen.getByRole("textbox", {
          name: "Theme colour",
        }) as HTMLInputElement
      ).value
    ).toBe("#DE00CE")
  })

  it("copies each install command exactly as shown", async () => {
    const writeText = vi.fn(async () => {})
    vi.stubGlobal("navigator", { ...navigator, clipboard: { writeText } })
    renderEditor()

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: "Copy the new project command" })
      )
    })
    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: "Copy the colours command" })
      )
    })

    expect(writeText.mock.calls).toEqual([
      [`npx shadcn@latest init --preset ${CODE}`],
      ["npx shadcn@latest add https://shadcnpreset.com/r/custom/cp-1.json"],
    ])
    expect(screen.getAllByRole("button", { name: "Copied" })).toHaveLength(2)
  })
})

async function typeColour(label: string, value: string) {
  const field = screen.getByRole("textbox", { name: label })
  await act(async () => {
    fireEvent.change(field, { target: { value } })
    fireEvent.keyDown(field, { key: "Enter" })
  })
}

function sentCode() {
  const body = vi.mocked(fetch).mock.calls.at(-1)?.[1]?.body
  return (JSON.parse(String(body)) as { presetCode: string }).presetCode
}

function sentColours() {
  const body = vi.mocked(fetch).mock.calls.at(-1)?.[1]?.body
  return (JSON.parse(String(body)) as { colours: unknown }).colours
}

function cssText() {
  return [...document.querySelectorAll("pre")]
    .map((pre) => pre.textContent)
    .join("\n")
}
