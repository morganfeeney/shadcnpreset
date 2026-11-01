// @vitest-environment jsdom
import { act, fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const { OklchPicker } = await import("@/components/custom-presets/oklch-picker")

let onChange: ReturnType<
  typeof vi.fn<(colour: string, settle: boolean) => void>
>

beforeEach(() => {
  onChange = vi.fn<(colour: string, settle: boolean) => void>()
  // jsdom draws nothing; the area is painted in a real browser.
  HTMLCanvasElement.prototype.getContext = () => null
})

function renderPicker(colour = "oklch(70.4% 0.191 22.2)") {
  return render(<OklchPicker colour={colour} onChange={onChange} />)
}

async function type(name: string, value: string) {
  const field = screen.getByRole("textbox", { name })
  await act(async () => {
    fireEvent.change(field, { target: { value } })
    fireEvent.keyDown(field, { key: "Enter" })
  })
}

function field(name: string) {
  return (screen.getByRole("textbox", { name }) as HTMLInputElement).value
}

describe("OklchPicker", () => {
  it("sets lightness typed as a percent, as an oklch colour", async () => {
    renderPicker()

    await type("Lightness, percent", "50")

    expect(onChange).toHaveBeenLastCalledWith("oklch(50% 0.191 22.2)", true)
  })

  it("keeps a typed value inside what the picker reaches", async () => {
    renderPicker()

    await type("Chroma", "2")

    expect(onChange).toHaveBeenLastCalledWith("oklch(70.4% 0.37 22.2)", true)
  })

  it("takes a pasted colour as written", async () => {
    renderPicker()

    await type("Colour", "#1E3A8A")

    expect(onChange).toHaveBeenLastCalledWith("#1E3A8A", true)
  })

  it("ignores text that isn't a colour", async () => {
    renderPicker()

    await type("Colour", "brand red")

    expect(onChange).not.toHaveBeenCalled()
    expect(field("Colour")).toBe("oklch(70.4% 0.191 22.2)")
  })

  it("picks from the area as it is dragged, and settles on release", async () => {
    renderPicker()
    const area = document.querySelector("canvas")!.parentElement!
    area.getBoundingClientRect = () =>
      ({ left: 0, top: 0, width: 200, height: 100 }) as DOMRect
    area.setPointerCapture = () => {}

    await act(async () => {
      fireEvent.pointerDown(area, { clientX: 0, clientY: 50, pointerId: 1 })
      fireEvent.pointerUp(area, { clientX: 0, clientY: 50, pointerId: 1 })
    })

    // Left edge: no chroma. Halfway down: half lightness. Same hue.
    expect(onChange.mock.calls.map(([, settle]) => settle)).toEqual([
      false,
      true,
    ])
    expect(onChange).toHaveBeenLastCalledWith("oklch(50% 0 22.2)", true)
  })

  it("keeps working in the same hue through a grey", () => {
    const { rerender } = renderPicker("oklch(60% 0.15 200)")

    rerender(<OklchPicker colour="#808080" onChange={onChange} />)

    expect(field("Hue, degrees")).toBe("200")
    expect(field("Chroma")).toBe("0")
  })

  it("says when most screens can't show the colour", () => {
    renderPicker("oklch(70.4% 0.3 22.2)")

    expect(screen.getByText(/Past what most screens show/)).toBeTruthy()
  })
})
