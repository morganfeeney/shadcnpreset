// @vitest-environment jsdom
import * as React from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("@/lib/analytics-events", () => ({ trackEvent: vi.fn() }))
const { useAddressQuery } = await import("@/hooks/use-address-query")
const { replaceQuery } = await import("@/lib/preset-draft")
const { PresetCustomizeProvider, usePresetCustomize } =
  await import("@/components/preset-customizer/preset-customize")

const CODE = "b5dyaqxe6"
const OTHER = "b4YtS7GakV"
const NONE = { overrides: {} }
const ORANGE = { theme: "#CC5500", overrides: {} }
const ORANGE_QUERY = `colours=${encodeURIComponent(JSON.stringify(ORANGE))}`

type Reply = { status: number; body: unknown }
let replies: Record<string, Reply>

beforeEach(() => {
  vi.clearAllMocks()
  replies = {}
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

describe("PresetCustomizeProvider", () => {
  it("is custom while it has custom colours, and not once they go", async () => {
    renderAt("")
    expect(screen.getByText(`${CODE} unchanged in preview`)).toBeTruthy()

    await click("Make it orange")
    expect(
      screen.getByText(`${CODE} changed with colours in preview`)
    ).toBeTruthy()
    expect(JSON.parse(query().get("colours")!)).toEqual(ORANGE)

    await click("Back as it was")
    expect(screen.getByText(`${CODE} unchanged in preview`)).toBeTruthy()
    expect(query().has("colours")).toBe(false)
  })

  it("leaves the address alone while a picker is dragged", async () => {
    renderAt("")

    await click("Drag to orange")

    expect(
      screen.getByText(`${CODE} changed with colours in preview`)
    ).toBeTruthy()
    expect(query().has("colours")).toBe(false)
  })

  it("comes back to the colours in the address, as after a reload", () => {
    renderAt(`&${ORANGE_QUERY}`)

    expect(
      screen.getByText(`${CODE} changed with colours in preview`)
    ).toBeTruthy()
  })

  it("goes to another preset for a listed choice, keeping the colours", async () => {
    renderAt(`&${ORANGE_QUERY}`)

    await click("Pick another style")

    expect(query().get("preset")).toBe(OTHER)
    expect(JSON.parse(query().get("colours")!)).toEqual(ORANGE)
    expect(
      screen.getByText(`${OTHER} changed with colours in preview`)
    ).toBeTruthy()
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

  it("turns an old link's saved preset into its preset and colours", async () => {
    replies["GET /api/custom-presets/cp-1"] = {
      status: 200,
      body: { id: "cp-1", presetCode: OTHER, colours: ORANGE },
    }
    renderAt("&custom=cp-1")

    await waitFor(() => expect(query().get("preset")).toBe(OTHER))
    expect(JSON.parse(query().get("colours")!)).toEqual(ORANGE)
    expect(query().has("custom")).toBe(false)
    expect(
      screen.getByText(`${OTHER} changed with colours in preview`)
    ).toBeTruthy()
  })

  it("lets go of an old link whose saved preset is gone", async () => {
    renderAt("&custom=gone")

    await waitFor(() => expect(query().has("custom")).toBe(false))
    expect(query().get("preset")).toBe(CODE)
  })
})
