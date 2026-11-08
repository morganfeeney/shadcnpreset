// @vitest-environment jsdom
import * as React from "react"
import { act, fireEvent, render } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import {
  CUSTOM_COLOURS_MESSAGE_TYPE,
  PRESET_CODE_MESSAGE_TYPE,
  PREVIEW_READY_MESSAGE_TYPE,
} from "@/lib/custom-preset-frame"

const { PresetV4Frame } = await import("@/components/preset-v4-frame")

const SRC = "/preset-preview/preview?preset=b0&custom=cp-1"

function sentColours(post: ReturnType<typeof vi.fn>) {
  return post.mock.calls
    .map(([message]) => message)
    .filter((message) => message.type === CUSTOM_COLOURS_MESSAGE_TYPE)
    .map((message) => message.css)
}

describe("PresetV4Frame with a custom preset's colours", () => {
  it("sends them once loaded, and again as they change, to this site only", async () => {
    const { container, rerender } = render(
      <PresetV4Frame src={SRC} title="Preview" customColoursCss="first" />
    )
    const frame = container.querySelector("iframe")!
    const post = vi.fn()
    vi.spyOn(frame, "contentWindow", "get").mockReturnValue({
      postMessage: post,
    } as unknown as Window)

    await act(async () => {
      fireEvent.load(frame)
    })
    expect(sentColours(post)).toContain("first")

    rerender(
      <PresetV4Frame src={SRC} title="Preview" customColoursCss="second" />
    )

    expect(sentColours(post).at(-1)).toBe("second")
    expect(post.mock.calls.at(-1)?.[1]).toBe(window.location.origin)
  })

  it("sends a new preset code too, ahead of the colours that sit over it", async () => {
    const { container, rerender } = render(
      <PresetV4Frame
        src={SRC}
        title="Preview"
        presetCode="b0"
        customColoursCss="first"
      />
    )
    const frame = container.querySelector("iframe")!
    const post = vi.fn()
    vi.spyOn(frame, "contentWindow", "get").mockReturnValue({
      postMessage: post,
    } as unknown as Window)
    await act(async () => {
      fireEvent.load(frame)
    })
    post.mockClear()

    rerender(
      <PresetV4Frame
        src={SRC}
        title="Preview"
        presetCode="b4pjDW9OBU"
        customColoursCss="second"
      />
    )

    expect(post.mock.calls.map(([message]) => message.type)).toEqual([
      PRESET_CODE_MESSAGE_TYPE,
      CUSTOM_COLOURS_MESSAGE_TYPE,
    ])
    expect(post.mock.calls[0][0].code).toBe("b4pjDW9OBU")
  })

  it("sends them when the preview says it is ready, though its load was missed", async () => {
    const { container, rerender } = render(
      <PresetV4Frame src={SRC} title="Preview" customColoursCss="first" />
    )
    const frame = container.querySelector("iframe")!
    const post = vi.fn()
    const preview = { postMessage: post } as unknown as Window
    vi.spyOn(frame, "contentWindow", "get").mockReturnValue(preview)

    await act(async () => {
      window.dispatchEvent(
        new MessageEvent("message", {
          data: { type: PREVIEW_READY_MESSAGE_TYPE },
          source: preview,
        })
      )
    })
    expect(sentColours(post)).toEqual(["first"])

    rerender(
      <PresetV4Frame src={SRC} title="Preview" customColoursCss="second" />
    )
    expect(sentColours(post).at(-1)).toBe("second")
  })

  it("still sends changes after its route was away and came back", async () => {
    // How Next keeps a route while another shows: hidden, never reloaded.
    const Route = ({ away, code }: { away: boolean; code: string }) => (
      <React.Activity mode={away ? "hidden" : "visible"}>
        <PresetV4Frame src={SRC} title="Preview" presetCode={code} />
      </React.Activity>
    )
    const { container, rerender } = render(<Route away={false} code="b0" />)
    const frame = container.querySelector("iframe")!
    const post = vi.fn()
    vi.spyOn(frame, "contentWindow", "get").mockReturnValue({
      postMessage: post,
    } as unknown as Window)
    await act(async () => {
      fireEvent.load(frame)
    })

    rerender(<Route away code="b0" />)
    rerender(<Route away={false} code="b0" />)
    post.mockClear()
    rerender(<Route away={false} code="b4pjDW9OBU" />)

    expect(
      post.mock.calls
        .map(([message]) => message)
        .filter((message) => message.type === PRESET_CODE_MESSAGE_TYPE)
        .map((message) => message.code)
    ).toEqual(["b4pjDW9OBU"])
  })
})
