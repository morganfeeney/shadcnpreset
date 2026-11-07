// @vitest-environment jsdom
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("@/lib/analytics-events", () => ({ trackEvent: vi.fn() }))
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }))
// Liking reads and writes votes of its own, which none of this is about.
vi.mock("@/components/preset-vote-button", () => ({
  PresetVoteButton: () => null,
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
  vi.mocked(toast.error).mockClear()
  respond = () => new Response("{}", { status: 200 })
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => respond())
  )
  // jsdom draws nothing; the picker's area is painted in a real browser.
  HTMLCanvasElement.prototype.getContext = () => null
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

async function openCode() {
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Code" }))
  })
  return screen.findByRole("dialog")
}

async function installCommands() {
  const dialog = await openCode()
  return within(dialog)
    .getAllByText(/shadcn(@\S+)? (init|add) /)
    .map((node) => node.textContent)
}

/** Opens a custom colour's picker and types a colour into it. */
async function typeColour(field: string, value: string) {
  await act(async () => {
    fireEvent.click(
      screen.getByRole("button", { name: new RegExp(`^${field}:`) })
    )
  })
  const text = await screen.findByRole("textbox", { name: "Colour" })
  await act(async () => {
    fireEvent.change(text, { target: { value } })
    fireEvent.keyDown(text, { key: "Enter" })
  })
}

function preview() {
  return document.querySelector("iframe") as HTMLIFrameElement
}

describe("CustomPresetEditor", () => {
  it("installs the preset, then the colours from its own link", async () => {
    renderEditor()

    expect(await installCommands()).toEqual(
      expect.arrayContaining([
        expect.stringContaining(`init --preset ${CODE} `),
        expect.stringContaining(
          "add https://shadcnpreset.com/r/custom/cp-1.json"
        ),
      ])
    )
  })

  it("shows create's preview of the preset with its colours", async () => {
    renderEditor()

    await waitFor(() =>
      expect(preview().getAttribute("src")).toBe(
        `/preset-preview/preview?preset=${CODE}&custom=cp-1`
      )
    )
  })

  it("switches the preview between views", async () => {
    renderEditor()

    await act(async () => {
      fireEvent.click(screen.getByRole("tab", { name: "Marketing" }))
    })

    await waitFor(() =>
      expect(preview().getAttribute("src")).toMatch(
        /\/preset-preview\/[^?]+\?preset=.+&custom=cp-1/
      )
    )
    expect(preview().getAttribute("src")).not.toContain("/preset-preview/preview?")
  })

  it("saves a changed facet and installs the new preset, without reloading the preview", async () => {
    renderEditor()
    await waitFor(() => expect(preview().getAttribute("src")).toBeTruthy())
    const before = preview().getAttribute("src")

    await pick("Style", "Nova")

    expect(fetch).toHaveBeenCalledWith(
      "/api/custom-presets/cp-1",
      expect.objectContaining({ method: "PATCH" })
    )
    const code = sentCode()
    expect(code).not.toBe(CODE)
    // The new code is sent into the frame, which shows it in place.
    expect(preview().getAttribute("src")).toBe(before)
    expect(await installCommands()).toEqual(
      expect.arrayContaining([
        expect.stringContaining(`init --preset ${code} `),
      ])
    )
  })

  it("repaints a listed colour or radius without reloading the preview", async () => {
    renderEditor()
    await waitFor(() => expect(preview().getAttribute("src")).toBeTruthy())
    const before = preview().getAttribute("src")

    await pick("Chart", "Amber")
    await pick("Radius", "Large")

    expect(sentCode()).not.toBe(CODE)
    expect(preview().getAttribute("src")).toBe(before)
    expect(await cssText()).toContain("--radius: 0.875rem;")
  })

  it("takes an edit from the chat in place, keeping the preview's frame", async () => {
    const view = renderEditor()
    await waitFor(() => expect(preview().getAttribute("src")).toBeTruthy())
    const frame = preview()
    const src = frame.getAttribute("src")

    view.rerender(
      <CustomPresetEditor
        id="cp-1"
        initialCode={CODE}
        colours={{ ...COLOURS, chartColor: "#00BDDF" }}
        canEdit
        origin="https://shadcnpreset.com"
      />
    )

    expect(preview()).toBe(frame)
    expect(preview().getAttribute("src")).toBe(src)
    expect(
      screen.getByRole("button", { name: "Chart colour: #00BDDF" })
    ).toBeTruthy()
    expect(fetch).not.toHaveBeenCalled()
  })

  it("goes back to the saved preset when a change does not save", async () => {
    respond = () => new Response("{}", { status: 500 })
    renderEditor()

    await pick("Style", "Nova")

    await waitFor(() => expect(toast.error).toHaveBeenCalled())
    expect(await installCommands()).toEqual(
      expect.arrayContaining([
        expect.stringContaining(`init --preset ${CODE} `),
      ])
    )
  })

  it("lets only the person who made it change it", () => {
    renderEditor(false)

    const style = screen.getByRole("combobox", { name: "Style" })
    expect(
      style.hasAttribute("disabled") || style.hasAttribute("data-disabled")
    ).toBe(true)
    expect(
      screen.getByText("Only the person who made this preset can change it.")
    ).toBeTruthy()
    expect(screen.getByRole("heading", { name: "Custom preset" })).toBeTruthy()
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

  it("shows a custom theme colour by its value", () => {
    renderEditor()

    expect(
      screen.getByRole("button", { name: "Theme colour: #DE00CE" })
    ).toBeTruthy()
    expect(screen.queryByRole("combobox", { name: "Theme" })).toBeNull()
  })

  it("saves an exact theme colour typed in, without reloading the preview", async () => {
    renderEditor()
    await waitFor(() => expect(preview().getAttribute("src")).toBeTruthy())
    const before = preview().getAttribute("src")

    await typeColour("Theme colour", "oklch(0.6 0.2 150)")

    expect(sentColours()).toEqual({
      theme: "oklch(0.6 0.2 150)",
      overrides: {},
    })
    expect(preview().getAttribute("src")).toBe(before)
    expect(await cssText()).toContain("--primary: oklch(0.6 0.2 150);")
  })

  it("keeps the colour when what's typed isn't one", async () => {
    renderEditor()

    await typeColour("Theme colour", "not a colour")

    expect(fetch).not.toHaveBeenCalled()
    expect(
      screen.getByRole("button", { name: "Theme colour: #DE00CE" })
    ).toBeTruthy()
  })

  it("goes back to a listed theme, dropping the custom colour", async () => {
    renderEditor()

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: "Use a listed Theme" })
      )
    })

    expect(sentColours()).toEqual({ overrides: {} })
    expect(screen.getByRole("combobox", { name: "Theme" })).toBeTruthy()
  })

  it("starts a custom base colour from the listed one", async () => {
    renderEditor()

    await pick("Base", "Custom…")

    const base = (sentColours() as { baseColor?: string }).baseColor
    expect(base).toEqual(expect.any(String))
    expect(
      screen.getByRole("button", { name: `Base colour: ${base}` })
    ).toBeTruthy()
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
    expect(await cssText()).toContain("--primary: #123456;")
  })

  it("goes back to the saved colour when a change does not save", async () => {
    respond = () => new Response("{}", { status: 500 })
    renderEditor()

    await typeColour("Theme colour", "#00FF00")

    await waitFor(() => expect(toast.error).toHaveBeenCalled())
    expect(
      screen.getByRole("button", { name: "Theme colour: #DE00CE" })
    ).toBeTruthy()
  })

  it("copies the preset's command, then its colours' command", async () => {
    const writeText = vi.fn(async () => {})
    vi.stubGlobal("navigator", { ...navigator, clipboard: { writeText } })
    renderEditor()
    const dialog = await openCode()

    for (const button of within(dialog).getAllByRole("button", {
      name: "Copy Command",
    })) {
      await act(async () => {
        fireEvent.click(button)
      })
    }

    expect(writeText.mock.calls).toEqual([
      [expect.stringContaining(`init --preset ${CODE} `)],
      [expect.stringContaining("add https://shadcnpreset.com/r/custom/cp-1.json")],
    ])
  })

  it("shares the saved preset on its preset's page", async () => {
    const writeText = vi.fn(async () => {})
    vi.stubGlobal("navigator", { ...navigator, clipboard: { writeText } })
    renderEditor()

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Share" }))
    })

    expect(writeText).toHaveBeenCalledWith(
      `https://shadcnpreset.com/preset/${CODE}?custom=cp-1`
    )
    expect(screen.getByRole("button", { name: "Copied" })).toBeTruthy()
  })
})

function sentCode() {
  const body = vi.mocked(fetch).mock.calls.at(-1)?.[1]?.body
  return (JSON.parse(String(body)) as { presetCode: string }).presetCode
}

function sentColours() {
  const body = vi.mocked(fetch).mock.calls.at(-1)?.[1]?.body
  return (JSON.parse(String(body)) as { colours: unknown }).colours
}

/** The colours as CSS, read from the Code dialog's theme. */
async function cssText() {
  const dialog = await openCode()
  await act(async () => {
    fireEvent.click(within(dialog).getByRole("button", { name: "Theme" }))
  })
  return [...dialog.querySelectorAll("pre")]
    .map((pre) => pre.textContent)
    .join("\n")
}
