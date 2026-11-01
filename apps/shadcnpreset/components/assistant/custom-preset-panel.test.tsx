// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

// The editor is tested on its own; here it shows what it was handed.
vi.mock("@/components/custom-presets/custom-preset-editor", () => ({
  CustomPresetEditor: (props: {
    initialCode: string
    canEdit: boolean
    embedded: boolean
  }) => (
    <p>
      Editor {props.initialCode} {props.canEdit ? "editable" : "read-only"}{" "}
      {props.embedded ? "embedded" : "page"}
    </p>
  ),
}))

const { CustomPresetPanel } =
  await import("@/components/assistant/custom-preset-panel")

let respond: () => Response

beforeEach(() => {
  respond = () =>
    new Response(
      JSON.stringify({
        id: "cp-1",
        presetCode: "b0",
        colours: { theme: "#DE00CE", overrides: {} },
        canEdit: true,
      }),
      { status: 200 }
    )
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => respond())
  )
})

function renderPanel() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  render(
    <QueryClientProvider client={client}>
      <CustomPresetPanel id="cp-1" onClose={() => {}} />
    </QueryClientProvider>
  )
}

describe("CustomPresetPanel", () => {
  it("loads the custom preset into the editor, without its page heading", async () => {
    renderPanel()

    expect(
      screen.getByRole("status", { name: "Loading custom preset" })
    ).toBeTruthy()
    expect(await screen.findByText("Editor b0 editable embedded")).toBeTruthy()
    expect(fetch).toHaveBeenCalledWith("/api/custom-presets/cp-1")
  })

  it("links to the full page to share", () => {
    renderPanel()

    const link = screen.getAllByText("Open full page")[0].closest("a")
    expect(link?.getAttribute("href")).toBe("/custom-presets/cp-1")
  })

  it("says so when the custom preset is gone", async () => {
    respond = () => new Response("{}", { status: 404 })
    renderPanel()

    expect(
      await screen.findByText("This custom preset couldn’t be found.")
    ).toBeTruthy()
  })
})
