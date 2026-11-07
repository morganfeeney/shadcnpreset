// @vitest-environment jsdom
import { act, fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

vi.mock("@/components/copy-button", () => ({
  copyToClipboardWithMeta: vi.fn(async () => true),
}))

const { copyToClipboardWithMeta } = await import("@/components/copy-button")
const { GetCodeDialog } = await import("@/components/get-code-dialog")

const CODE = "b5dyaqxe6"
const CSS = ":root { --primary: oklch(0.6 0.2 40); }"

function renderDialog(customColours?: { css: string; registryUrl?: string }) {
  render(
    <GetCodeDialog
      open
      onOpenChange={() => {}}
      presetCode={CODE}
      customColours={customColours}
    />
  )
}

describe("GetCodeDialog", () => {
  it("is only the preset's command without custom colours", () => {
    renderDialog()

    expect(screen.queryByText("Then add your colours")).toBeNull()
  })

  it("follows the command with the colours as CSS before they are saved", async () => {
    renderDialog({ css: CSS })

    expect(screen.getByText("Then add your colours")).toBeTruthy()
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copy CSS" }))
    })
    expect(copyToClipboardWithMeta).toHaveBeenLastCalledWith(
      CSS,
      expect.anything()
    )
  })

  it("installs saved colours from their own link", () => {
    renderDialog({
      css: CSS,
      registryUrl: "https://shadcnpreset.com/r/custom/cp-1.json",
    })

    expect(
      screen.getAllByText(/add https:\/\/shadcnpreset\.com\/r\/custom\/cp-1\.json/)
        .length
    ).toBeGreaterThan(0)
    expect(screen.queryByRole("button", { name: "Copy CSS" })).toBeNull()
  })
})
