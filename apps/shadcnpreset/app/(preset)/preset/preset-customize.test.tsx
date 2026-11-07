// @vitest-environment jsdom
import * as React from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("@/lib/analytics-events", () => ({ trackEvent: vi.fn() }))
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }))

const LIVE = "b5dyaqxe6"
vi.mock("@/components/preset-page-live-context", () => ({
  usePresetPageLive: () => ({ livePresetCode: LIVE }),
}))

// The address as Next keeps it: replacing it in place re-renders whatever
// reads it.
const addressListeners = new Set<() => void>()
const nativeReplaceState = window.history.replaceState.bind(window.history)
window.history.replaceState = (...args) => {
  nativeReplaceState(...args)
  addressListeners.forEach((listener) => listener())
}
function useAddress() {
  return React.useSyncExternalStore(
    (listener) => {
      addressListeners.add(listener)
      return () => addressListeners.delete(listener)
    },
    () => window.location.search
  )
}
const replace = vi.fn((path: string) =>
  window.history.replaceState(null, "", path)
)
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => new URLSearchParams(useAddress()),
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

const NONE = { overrides: {} }
const ORANGE = { theme: "#CC5500", overrides: {} }

type Reply = { status: number; body: unknown }
let replies: Record<string, Reply>

beforeEach(() => {
  vi.clearAllMocks()
  signedIn = true
  replies = {
    "POST /api/custom-presets": { status: 200, body: { id: "cp-9" } },
  }
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init?: RequestInit) => {
      const reply = replies[`${init?.method ?? "GET"} ${url}`]
      return new Response(JSON.stringify(reply?.body ?? {}), {
        status: reply?.status ?? 404,
      })
    })
  )
  window.history.replaceState(null, "", `/preset/${LIVE}`)
})

function Probe() {
  const customize = usePresetCustomize()
  return (
    <>
      <p>
        {customize.isChanged ? "changed" : "unchanged"}
        {customize.saved ? " saved" : ""}
        {customize.css ? " with colours" : ""}
      </p>
      <button
        type="button"
        onClick={() => customize.setValue({ code: LIVE, colours: ORANGE })}
      >
        Make it orange
      </button>
      <button
        type="button"
        onClick={() => customize.setValue({ code: LIVE, colours: ORANGE }, false)}
      >
        Drag to orange
      </button>
      <button
        type="button"
        onClick={() => customize.setValue({ code: LIVE, colours: NONE })}
      >
        Back as it was
      </button>
      <button
        type="button"
        onClick={() =>
          customize.setValue({ code: OTHER, colours: customize.value.colours })
        }
      >
        Pick another style
      </button>
      <button type="button" onClick={customize.reset}>
        Reset
      </button>
      <button type="button" onClick={customize.save}>
        Save
      </button>
    </>
  )
}

function renderAt(path: string) {
  window.history.replaceState(null, "", path)
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <PresetCustomizeProvider>
        <Probe />
      </PresetCustomizeProvider>
    </QueryClientProvider>
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

function sent(index = 0) {
  const [url, init] = vi.mocked(fetch).mock.calls.filter(
    ([, init]) => init?.method
  )[index]
  return { url, method: init?.method, body: JSON.parse(String(init?.body)) }
}

const ORANGE_DRAFT = `colours=${encodeURIComponent(JSON.stringify(ORANGE))}`
const OTHER = "b4YtS7GakV"

describe("PresetCustomizeProvider", () => {
  it("is a draft while it has custom colours, and not once they go", async () => {
    renderAt(`/preset/${LIVE}`)
    expect(screen.getByText("unchanged")).toBeTruthy()

    await click("Make it orange")
    expect(screen.getByText("changed with colours")).toBeTruthy()
    expect(JSON.parse(query().get("colours")!)).toEqual(ORANGE)

    await click("Back as it was")
    expect(screen.getByText("unchanged")).toBeTruthy()
    expect(window.location.search).toBe("")
  })

  it("leaves the address alone while a picker is dragged", async () => {
    renderAt(`/preset/${LIVE}`)

    await click("Drag to orange")

    expect(screen.getByText("changed with colours")).toBeTruthy()
    expect(window.location.search).toBe("")
  })

  it("comes back to the changes in the address, as after a reload", () => {
    renderAt(`/preset/${LIVE}?${ORANGE_DRAFT}`)

    expect(screen.getByText("changed with colours")).toBeTruthy()
  })

  it("reads colours that set nothing as none", () => {
    renderAt(`/preset/${LIVE}?colours=${encodeURIComponent(JSON.stringify(NONE))}`)

    expect(screen.getByText("unchanged")).toBeTruthy()
  })

  it("moves to another preset for a listed choice, without making a draft", async () => {
    renderAt(`/preset/${LIVE}?view=dashboard`)

    await click("Pick another style")

    expect(replace).toHaveBeenCalledWith(`/preset/${OTHER}?view=dashboard`, {
      scroll: false,
    })
  })

  it("carries custom colours over to the other preset", async () => {
    renderAt(`/preset/${LIVE}?${ORANGE_DRAFT}`)

    await click("Pick another style")

    expect(replace).toHaveBeenCalledWith(`/preset/${OTHER}?${ORANGE_DRAFT}`, {
      scroll: false,
    })
  })

  it("resets to the preset", async () => {
    renderAt(`/preset/${LIVE}?view=dashboard&${ORANGE_DRAFT}`)

    await click("Reset")

    expect(screen.getByText("unchanged")).toBeTruthy()
    expect(window.location.search).toBe("?view=dashboard")
  })

  it("saves the changes and stays, now showing the saved preset", async () => {
    renderAt(`/preset/${LIVE}?${ORANGE_DRAFT}`)

    await click("Save")

    expect(sent()).toEqual({
      url: "/api/custom-presets",
      method: "POST",
      body: { presetCode: LIVE, colours: ORANGE },
    })
    expect(replace).toHaveBeenCalledWith(`/preset/${LIVE}?custom=cp-9`, {
      scroll: false,
    })
    expect(toast.success).toHaveBeenCalled()
    expect(screen.getByText("unchanged saved with colours")).toBeTruthy()
  })

  it("shows a saved preset, and saves changes to it in place", async () => {
    replies["GET /api/custom-presets/cp-1"] = {
      status: 200,
      body: { id: "cp-1", presetCode: LIVE, colours: ORANGE, canEdit: true },
    }
    replies["PATCH /api/custom-presets/cp-1"] = { status: 200, body: { ok: true } }
    renderAt(`/preset/${LIVE}?custom=cp-1`)
    await waitFor(() =>
      expect(screen.getByText("unchanged saved with colours")).toBeTruthy()
    )

    await click("Back as it was")
    expect(screen.getByText("changed saved")).toBeTruthy()
    await click("Save")

    expect(sent()).toEqual({
      url: "/api/custom-presets/cp-1",
      method: "PATCH",
      body: { presetCode: LIVE, colours: NONE },
    })
  })

  it("saves someone else's preset as a new one", async () => {
    replies["GET /api/custom-presets/cp-1"] = {
      status: 200,
      body: { id: "cp-1", presetCode: LIVE, colours: NONE, canEdit: false },
    }
    renderAt(`/preset/${LIVE}?custom=cp-1`)
    await waitFor(() => expect(screen.getByText("unchanged saved")).toBeTruthy())

    await click("Make it orange")
    await click("Save")

    expect(sent().method).toBe("POST")
  })

  it("asks someone signed out to sign in, and forgets it if they don't", async () => {
    signedIn = false
    renderAt(`/preset/${LIVE}?${ORANGE_DRAFT}`)

    await click("Save")
    expect(query().get("save")).toBe("1")
    expect(fetch).not.toHaveBeenCalled()

    act(() => authListener?.({ dialogOpen: false }))
    expect(query().has("save")).toBe(false)
    expect(JSON.parse(query().get("colours")!)).toEqual(ORANGE)
  })

  it("saves on arriving back from signing in, once", async () => {
    renderAt(`/preset/${LIVE}?${ORANGE_DRAFT}&save=1`)

    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith(`/preset/${LIVE}?custom=cp-9`, {
        scroll: false,
      })
    )
    expect(vi.mocked(fetch).mock.calls.filter(([, i]) => i?.method)).toHaveLength(1)
  })

  it("offers Pro past the free cap, and keeps the changes", async () => {
    replies["POST /api/custom-presets"] = {
      status: 402,
      body: { code: "custom_preset_limit", error: "At the cap." },
    }
    renderAt(`/preset/${LIVE}?${ORANGE_DRAFT}`)

    await click("Save")

    expect(toast.error).toHaveBeenCalledWith("At the cap.", expect.anything())
    expect(screen.getByText("changed with colours")).toBeTruthy()
  })
})
