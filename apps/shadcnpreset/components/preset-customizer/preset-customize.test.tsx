// @vitest-environment jsdom
import * as React from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("@/lib/analytics-events", () => ({ trackEvent: vi.fn() }))
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }))

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
const { useAddressQuery } = await import("@/hooks/use-address-query")
const { replaceQuery } = await import("@/lib/preset-draft")
const { PresetCustomizeProvider, usePresetCustomize } = await import(
  "@/components/preset-customizer/preset-customize"
)

const CODE = "b5dyaqxe6"
const OTHER = "b4YtS7GakV"
const NONE = { overrides: {} }
const ORANGE = { theme: "#CC5500", overrides: {} }
const ORANGE_QUERY = `colours=${encodeURIComponent(JSON.stringify(ORANGE))}`

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
})

/** A page as Ask AI has it: the code in `?preset=`, the rest beside it. */
function Page({ children }: { children: React.ReactNode }) {
  const query = useAddressQuery()
  const goTo = React.useCallback((code: string, next: URLSearchParams) => {
    const search = new URLSearchParams(next)
    search.set("preset", code)
    replaceQuery(search)
  }, [])
  return (
    <PresetCustomizeProvider
      code={query.get("preset") ?? CODE}
      query={query}
      goTo={goTo}
    >
      {children}
    </PresetCustomizeProvider>
  )
}

function Probe() {
  const customize = usePresetCustomize()
  const { code, colours } = customize.value
  return (
    <>
      <p>
        {code} {customize.isChanged ? "changed" : "unchanged"}
        {customize.saved ? " saved" : ""}
        {customize.css ? " with colours" : ""} in {customize.view}
      </p>
      <button
        type="button"
        onClick={() => customize.setValue({ code, colours: ORANGE })}
      >
        Make it orange
      </button>
      <button
        type="button"
        onClick={() => customize.setValue({ code, colours: ORANGE }, false)}
      >
        Drag to orange
      </button>
      <button
        type="button"
        onClick={() => customize.setValue({ code, colours: NONE })}
      >
        Back as it was
      </button>
      <button
        type="button"
        onClick={() => customize.setValue({ code: OTHER, colours })}
      >
        Pick another style
      </button>
      <button type="button" onClick={() => customize.setView("marketing")}>
        Marketing
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

function renderAt(search: string) {
  window.history.replaceState(null, "", `/assistant?preset=${CODE}${search}`)
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <Page>
        <Probe />
      </Page>
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
  const [url, init] = vi
    .mocked(fetch)
    .mock.calls.filter(([, init]) => init?.method)[index]
  return { url, method: init?.method, body: JSON.parse(String(init?.body)) }
}

describe("PresetCustomizeProvider", () => {
  it("is a draft while it has custom colours, and not once they go", async () => {
    renderAt("")
    expect(screen.getByText(`${CODE} unchanged in preview`)).toBeTruthy()

    await click("Make it orange")
    expect(screen.getByText(`${CODE} changed with colours in preview`)).toBeTruthy()
    expect(JSON.parse(query().get("colours")!)).toEqual(ORANGE)

    await click("Back as it was")
    expect(screen.getByText(`${CODE} unchanged in preview`)).toBeTruthy()
    expect(query().has("colours")).toBe(false)
  })

  it("leaves the address alone while a picker is dragged", async () => {
    renderAt("")

    await click("Drag to orange")

    expect(screen.getByText(`${CODE} changed with colours in preview`)).toBeTruthy()
    expect(query().has("colours")).toBe(false)
  })

  it("comes back to the colours in the address, as after a reload", () => {
    renderAt(`&${ORANGE_QUERY}`)

    expect(screen.getByText(`${CODE} changed with colours in preview`)).toBeTruthy()
  })

  it("goes to another preset for a listed choice, keeping the colours", async () => {
    renderAt(`&${ORANGE_QUERY}`)

    await click("Pick another style")

    expect(query().get("preset")).toBe(OTHER)
    expect(JSON.parse(query().get("colours")!)).toEqual(ORANGE)
    expect(screen.getByText(`${OTHER} changed with colours in preview`)).toBeTruthy()
  })

  it("keeps the view in the address", async () => {
    renderAt("")

    await click("Marketing")

    expect(query().get("view")).toBe("marketing")
    expect(screen.getByText(`${CODE} unchanged in marketing`)).toBeTruthy()
  })

  it("resets to the preset, in the same view", async () => {
    renderAt(`&view=dashboard&${ORANGE_QUERY}`)

    await click("Reset")

    expect(screen.getByText(`${CODE} unchanged in dashboard`)).toBeTruthy()
    expect(query().has("colours")).toBe(false)
  })

  it("saves the colours and shows the saved preset", async () => {
    renderAt(`&${ORANGE_QUERY}`)

    await click("Save")

    expect(sent()).toEqual({
      url: "/api/custom-presets",
      method: "POST",
      body: { presetCode: CODE, colours: ORANGE },
    })
    expect(query().get("custom")).toBe("cp-9")
    expect(query().has("colours")).toBe(false)
    expect(toast.success).toHaveBeenCalled()
    expect(
      screen.getByText(`${CODE} unchanged saved with colours in preview`)
    ).toBeTruthy()
  })

  it("shows a saved preset, and saves changes to it in place", async () => {
    replies["GET /api/custom-presets/cp-1"] = {
      status: 200,
      body: { id: "cp-1", presetCode: CODE, colours: ORANGE, canEdit: true },
    }
    replies["PATCH /api/custom-presets/cp-1"] = { status: 200, body: { ok: true } }
    renderAt("&custom=cp-1")
    await waitFor(() =>
      expect(
        screen.getByText(`${CODE} unchanged saved with colours in preview`)
      ).toBeTruthy()
    )

    await click("Back as it was")
    expect(screen.getByText(`${CODE} changed saved in preview`)).toBeTruthy()
    await click("Save")

    expect(sent()).toEqual({
      url: "/api/custom-presets/cp-1",
      method: "PATCH",
      body: { presetCode: CODE, colours: NONE },
    })
  })

  it("saves someone else's preset as a new one", async () => {
    replies["GET /api/custom-presets/cp-1"] = {
      status: 200,
      body: { id: "cp-1", presetCode: CODE, colours: NONE, canEdit: false },
    }
    renderAt("&custom=cp-1")
    await waitFor(() =>
      expect(screen.getByText(`${CODE} unchanged saved in preview`)).toBeTruthy()
    )

    await click("Make it orange")
    await click("Save")

    expect(sent().method).toBe("POST")
  })

  it("asks someone signed out to sign in, and forgets it if they don't", async () => {
    signedIn = false
    renderAt(`&${ORANGE_QUERY}`)

    await click("Save")
    expect(query().get("save")).toBe("1")
    expect(fetch).not.toHaveBeenCalled()

    act(() => authListener?.({ dialogOpen: false }))
    expect(query().has("save")).toBe(false)
    expect(JSON.parse(query().get("colours")!)).toEqual(ORANGE)
  })

  it("saves on arriving back from signing in, once", async () => {
    renderAt(`&${ORANGE_QUERY}&save=1`)

    await waitFor(() => expect(query().get("custom")).toBe("cp-9"))
    expect(
      vi.mocked(fetch).mock.calls.filter(([, init]) => init?.method)
    ).toHaveLength(1)
    expect(query().has("save")).toBe(false)
  })

  it("offers Pro past the free cap, and keeps the changes", async () => {
    replies["POST /api/custom-presets"] = {
      status: 402,
      body: { code: "custom_preset_limit", error: "At the cap." },
    }
    renderAt(`&${ORANGE_QUERY}`)

    await click("Save")

    expect(toast.error).toHaveBeenCalledWith("At the cap.", expect.anything())
    expect(screen.getByText(`${CODE} changed with colours in preview`)).toBeTruthy()
  })
})
