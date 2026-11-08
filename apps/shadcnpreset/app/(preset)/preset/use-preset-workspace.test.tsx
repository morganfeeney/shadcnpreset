// @vitest-environment jsdom
import { act, render } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(window.location.search),
}))

const { WorkspacePanel, WorkspaceProvider } = await import(
  "@/components/workspace"
)
const { usePresetWorkspace } = await import(
  "@/app/(preset)/preset/use-preset-workspace"
)

function screenWidth(width: number) {
  vi.stubGlobal("matchMedia", () => ({
    matches: width < 768,
    addEventListener: () => {},
    removeEventListener: () => {},
  }))
  Object.defineProperty(window, "innerWidth", { value: width, configurable: true })
}

beforeEach(() => {
  // Someone who closed Customize last time.
  window.localStorage.setItem(
    "preset-workspace",
    JSON.stringify({ start: true, end: false })
  )
  screenWidth(1440)
})

function PresetWorkspace() {
  return (
    <WorkspaceProvider {...usePresetWorkspace()}>
      <WorkspacePanel side="end" label="Customize" collapsible="offcanvas">
        The properties
      </WorkspacePanel>
    </WorkspaceProvider>
  )
}

async function arriveAt(path: string) {
  window.history.replaceState(null, "", path)
  await act(async () => {
    render(<PresetWorkspace />)
  })
  return document.querySelector<HTMLElement>(
    '[data-slot="workspace-panel"]'
  )
}

describe("usePresetWorkspace", () => {
  it("opens Customize on arriving from a card's Customize, and keeps it open", async () => {
    const panel = await arriveAt("/preset/b5dyaqxe6?view=dashboard&customize")

    expect(panel?.dataset.state).toBe("expanded")
    expect(window.location.search).toBe("?view=dashboard")
    expect(
      JSON.parse(window.localStorage.getItem("preset-workspace")!)
    ).toEqual({ start: true, end: true })
  })

  it("opens it as a sheet on a phone", async () => {
    screenWidth(390)
    const panel = await arriveAt("/preset/b5dyaqxe6?customize")

    expect(panel?.textContent).toContain("The properties")
  })

  it("leaves it as it was on arriving any other way", async () => {
    const panel = await arriveAt("/preset/b5dyaqxe6")

    expect(panel?.dataset.state).toBe("collapsed")
  })
})
