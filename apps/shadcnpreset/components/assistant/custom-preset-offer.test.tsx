// @vitest-environment jsdom
import { act, fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("@/lib/analytics-events", () => ({ trackEvent: vi.fn() }))
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }))
const onOpen = vi.fn()
const onLimit = vi.fn()

const { trackEvent } = await import("@/lib/analytics-events")
const { toast } = await import("sonner")
const { CustomPresetOffer } =
  await import("@/components/assistant/custom-preset-offer")

const TEXT = "Primary #DE00CE"
const COLOURS = [{ colour: "#DE00CE", token: "primary" as const }]

let respond: () => Response

beforeEach(() => {
  vi.clearAllMocks()
  respond = () => new Response(JSON.stringify({ id: "cp-1" }), { status: 200 })
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => respond())
  )
})

function renderOffer() {
  render(
    <CustomPresetOffer
      text={TEXT}
      colours={COLOURS}
      presetCode="b5dyaqxe6"
      chatId="chat-1"
      openId={null}
      onOpen={onOpen}
      onLimit={onLimit}
    />
  )
}

async function useColours() {
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Use my colours" }))
  })
}

describe("CustomPresetOffer", () => {
  it("counts a view when shown", () => {
    renderOffer()
    expect(vi.mocked(trackEvent).mock.calls.map(([name]) => name)).toEqual([
      "custom_preset_offer_view",
    ])
  })

  it("makes the custom preset and opens it beside the chat", async () => {
    renderOffer()
    await useColours()

    expect(fetch).toHaveBeenCalledWith(
      "/api/custom-presets",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          presetCode: "b5dyaqxe6",
          text: TEXT,
          chatId: "chat-1",
        }),
      })
    )
    expect(onOpen).toHaveBeenCalledWith("cp-1")
  })

  it("offers Pro, not an error, once the account's cap is reached", async () => {
    respond = () =>
      new Response(JSON.stringify({ code: "custom_preset_limit", limit: 3 }), {
        status: 402,
      })
    renderOffer()
    await useColours()

    expect(onLimit).toHaveBeenCalledWith(3)
    expect(onOpen).not.toHaveBeenCalled()
    expect(toast.error).not.toHaveBeenCalled()
  })

  it("reopens the one it made rather than making another", async () => {
    renderOffer()
    await useColours()
    await useColours()

    expect(fetch).toHaveBeenCalledTimes(1)
    expect(onOpen.mock.calls).toEqual([["cp-1"], ["cp-1"]])
  })

  it("says so when it can't be made, and lets them try again", async () => {
    respond = () => new Response("{}", { status: 500 })
    renderOffer()
    await useColours()

    expect(toast.error).toHaveBeenCalled()
    expect(onOpen).not.toHaveBeenCalled()
    expect(
      (
        screen.getByRole("button", {
          name: "Use my colours",
        }) as HTMLButtonElement
      ).disabled
    ).toBe(false)
  })
})
