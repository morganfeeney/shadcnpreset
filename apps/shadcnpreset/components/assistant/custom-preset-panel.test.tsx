// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

// The editor is tested on its own; here it shows what it was handed.
vi.mock("@/components/custom-presets/custom-preset-editor", () => ({
  CustomPresetEditor: (props: {
    initialCode: string
    canEdit: boolean
    start: React.ReactNode
    end: React.ReactNode
  }) => (
    <div>
      {props.start}
      <p>
        Editor {props.initialCode} {props.canEdit ? "editable" : "read-only"}
      </p>
      {props.end}
    </div>
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

let onClose: ReturnType<typeof vi.fn<() => void>>

function renderPanel() {
  onClose = vi.fn<() => void>()
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  render(
    <QueryClientProvider client={client}>
      <CustomPresetPanel id="cp-1" onClose={onClose} />
    </QueryClientProvider>
  )
}

describe("CustomPresetPanel", () => {
  it("loads the custom preset into the editor", async () => {
    renderPanel()

    expect(
      screen.getByRole("status", { name: "Loading custom preset" })
    ).toBeTruthy()
    expect(await screen.findByText("Editor b0 editable")).toBeTruthy()
    expect(fetch).toHaveBeenCalledWith("/api/custom-presets/cp-1")
  })

  it("gives the editor its ways out: back to the chat, and close", async () => {
    renderPanel()
    await screen.findByText("Editor b0 editable")

    fireEvent.click(screen.getByRole("button", { name: "Chat" }))
    fireEvent.click(screen.getByRole("button", { name: "Close" }))

    expect(onClose).toHaveBeenCalledTimes(2)
  })

  it("says so when the custom preset is gone", async () => {
    respond = () => new Response("{}", { status: 404 })
    renderPanel()

    expect(
      await screen.findByText("This custom preset couldn’t be found.")
    ).toBeTruthy()
  })
})
