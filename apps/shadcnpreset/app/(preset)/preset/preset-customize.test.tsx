// @vitest-environment jsdom
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("@/lib/analytics-events", () => ({ trackEvent: vi.fn() }))
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }))

let livePresetCode = "b5dyaqxe6"
vi.mock("@/components/preset-page-live-context", () => ({
  usePresetPageLive: () => ({ livePresetCode }),
}))

const push = vi.fn()
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => new URLSearchParams(window.location.search),
}))

let signedIn = true
const ensureAuthenticated = vi.fn(async () => signedIn)
let authListener: ((state: { dialogOpen: boolean }) => void) | null = null
vi.mock("@/stores/auth-store", () => ({
  useAuthStore: Object.assign(
    (select: (state: unknown) => unknown) => select({ ensureAuthenticated }),
    {
      subscribe: (listener: typeof authListener) => {
        authListener = listener
        return () => {
          authListener = null
        }
      },
    }
  ),
}))

const { toast } = await import("sonner")
const { PresetCustomizeProvider, usePresetCustomize } = await import(
  "@/app/(preset)/preset/preset-customize"
)

const ORANGE = { theme: "#CC5500", overrides: {} }
let respond: () => Response

beforeEach(() => {
  vi.clearAllMocks()
  signedIn = true
  livePresetCode = "b5dyaqxe6"
  respond = () => new Response(JSON.stringify({ id: "cp-9" }), { status: 200 })
  vi.stubGlobal("fetch", vi.fn(async () => respond()))
  window.history.replaceState(null, "", "/preset/b5dyaqxe6")
})

function Probe() {
  const customize = usePresetCustomize()
  return (
    <>
      <p>
        {customize.value.code} {customize.isDraft ? "draft" : "as is"}{" "}
        {customize.css ? "with colours" : "no colours"}
      </p>
      <button
        type="button"
        onClick={() =>
          customize.setValue({ code: customize.value.code, colours: ORANGE })
        }
      >
        Make it orange
      </button>
      <button type="button" onClick={customize.save}>
        Save
      </button>
    </>
  )
}

function renderProbe() {
  return render(
    <PresetCustomizeProvider>
      <Probe />
    </PresetCustomizeProvider>
  )
}

async function click(name: string) {
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name }))
  })
}

function query() {
  return new URLSearchParams(window.location.search)
}

describe("PresetCustomizeProvider", () => {
  it("makes a draft of the preset on show, and keeps it in the address", async () => {
    renderProbe()
    expect(screen.getByText("b5dyaqxe6 as is no colours")).toBeTruthy()

    await click("Make it orange")

    expect(screen.getByText("b5dyaqxe6 draft with colours")).toBeTruthy()
    expect(query().get("draft")).toBe("b5dyaqxe6")
    expect(JSON.parse(query().get("colours")!)).toEqual(ORANGE)
    expect(fetch).not.toHaveBeenCalled()
  })

  it("comes back to the draft in the address, as after a reload", () => {
    window.history.replaceState(
      null,
      "",
      `/preset/b5dyaqxe6?draft=b5dyaqxe6&colours=${encodeURIComponent(JSON.stringify(ORANGE))}`
    )
    renderProbe()

    expect(screen.getByText("b5dyaqxe6 draft with colours")).toBeTruthy()
  })

  it("leaves the draft behind when another preset is chosen", async () => {
    const { rerender } = renderProbe()
    await click("Make it orange")

    livePresetCode = "b4YtS7GakV"
    rerender(
      <PresetCustomizeProvider>
        <Probe />
      </PresetCustomizeProvider>
    )

    expect(screen.getByText("b4YtS7GakV as is no colours")).toBeTruthy()
  })

  it("saves the draft as it is and moves to its own page", async () => {
    renderProbe()
    await click("Make it orange")
    await click("Save")

    const [url, init] = vi.mocked(fetch).mock.calls[0]
    expect(url).toBe("/api/custom-presets")
    expect(JSON.parse(String(init?.body))).toEqual({
      presetCode: "b5dyaqxe6",
      colours: ORANGE,
    })
    expect(push).toHaveBeenCalledWith("/custom-presets/cp-9")
  })

  it("asks someone signed out to sign in, and to save on the way back", async () => {
    signedIn = false
    renderProbe()
    await click("Make it orange")
    await click("Save")

    expect(ensureAuthenticated).toHaveBeenCalled()
    expect(fetch).not.toHaveBeenCalled()
    expect(window.location.pathname).toBe("/preset/b5dyaqxe6")
    expect(query().get("draft")).toBe("b5dyaqxe6")
    expect(query().get("save")).toBe("1")
  })

  it("forgets to save when the sign-in dialog is closed instead", async () => {
    signedIn = false
    renderProbe()
    await click("Make it orange")
    await click("Save")

    act(() => authListener?.({ dialogOpen: false }))

    expect(query().has("save")).toBe(false)
    expect(query().get("draft")).toBe("b5dyaqxe6")
  })

  it("saves on arriving back from signing in, once", async () => {
    window.history.replaceState(
      null,
      "",
      `/preset/b5dyaqxe6?draft=b5dyaqxe6&colours=${encodeURIComponent(JSON.stringify(ORANGE))}&save=1`
    )
    renderProbe()

    await waitFor(() => expect(push).toHaveBeenCalledWith("/custom-presets/cp-9"))
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(query().has("save")).toBe(false)
  })

  it("offers Pro past the free cap, and keeps the draft", async () => {
    respond = () =>
      new Response(
        JSON.stringify({ code: "custom_preset_limit", error: "At the cap." }),
        { status: 402 }
      )
    renderProbe()
    await click("Make it orange")
    await click("Save")

    expect(toast.error).toHaveBeenCalledWith("At the cap.", expect.anything())
    expect(push).not.toHaveBeenCalled()
    expect(screen.getByText("b5dyaqxe6 draft with colours")).toBeTruthy()
  })
})
