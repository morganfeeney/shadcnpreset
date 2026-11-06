// @vitest-environment jsdom
import { act, fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const { useStoredWorkspaceOpen } = await import(
  "@/hooks/use-stored-workspace-open"
)
const {
  WorkspacePanel,
  WorkspacePanelContent,
  WorkspacePanelRail,
  WorkspacePanelTrigger,
  WorkspaceProvider,
} = await import("@/components/workspace")

beforeEach(() => {
  window.localStorage.clear()
  // A wide screen: panels sit in the page rather than in sheets.
  vi.stubGlobal("matchMedia", () => ({
    matches: false,
    addEventListener: () => {},
    removeEventListener: () => {},
  }))
  Object.defineProperty(window, "innerWidth", { value: 1440, configurable: true })
})

/** A workspace as the preset page has it: its panels remembered. */
function StoredWorkspace({
  collapsible,
  children,
}: {
  collapsible?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useStoredWorkspaceOpen("test-workspace")
  return (
    <WorkspaceProvider
      open={open}
      onOpenChange={setOpen}
      collapsible={collapsible}
    >
      {children}
    </WorkspaceProvider>
  )
}

function renderWorkspace(props: { collapsible?: boolean } = {}) {
  return render(
    <StoredWorkspace {...props}>
      <WorkspacePanel side="start" label="Community">
        <WorkspacePanelTrigger />
        <WorkspacePanelContent>The list</WorkspacePanelContent>
        <WorkspacePanelRail>The covers</WorkspacePanelRail>
      </WorkspacePanel>
      <WorkspacePanelTrigger side="end" label="Customize">
        Customize
      </WorkspacePanelTrigger>
      <WorkspacePanel side="end" label="Customize" collapsible="offcanvas" />
    </StoredWorkspace>
  )
}

/** A panel whether shown or not, to read its state. */
function panel(name: string) {
  return document.querySelector<HTMLElement>(
    `[data-slot="workspace-panel"][aria-label="${name}"]`
  )!
}

describe("Workspace", () => {
  it("collapses a panel from its own trigger, or one elsewhere", async () => {
    renderWorkspace()
    expect(panel("Community").dataset.state).toBe("expanded")

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Collapse Community" }))
    })
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Customize" }))
    })

    expect(panel("Community").dataset.state).toBe("collapsed")
    expect(panel("Customize").dataset.state).toBe("collapsed")
    // A rail stays to glance at; an offcanvas panel goes.
    expect(screen.getByText("The covers")).toBeTruthy()
    expect(screen.queryByRole("complementary", { name: "Customize" })).toBeNull()
    expect(
      screen.getByRole("button", { name: "Customize" }).getAttribute("aria-expanded")
    ).toBe("false")
  })

  it("remembers which panels are collapsed", async () => {
    const { unmount } = renderWorkspace()
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Collapse Community" }))
    })
    unmount()

    renderWorkspace()

    expect(panel("Community").dataset.state).toBe("collapsed")
    expect(panel("Customize").dataset.state).toBe("expanded")
  })

  it("keeps panels open, with nothing to collapse them, when collapsing is off", () => {
    window.localStorage.setItem(
      "test-workspace",
      JSON.stringify({ start: false, end: false })
    )
    renderWorkspace({ collapsible: false })

    expect(panel("Community").dataset.state).toBe("expanded")
    expect(screen.queryByRole("button")).toBeNull()
  })
})
