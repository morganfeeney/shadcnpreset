// @vitest-environment jsdom
import * as React from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("next/navigation", () => ({ usePathname: () => "/preset/b5dyaqxe6" }))
vi.mock("@/lib/analytics-events", () => ({ trackEvent: vi.fn() }))
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }))

let status: "authenticated" | "unauthenticated" = "authenticated"
const ensureAuthenticated = vi.fn(async () => status === "authenticated")
vi.mock("@/stores/auth-store", () => ({
  useAuthStore: Object.assign(
    (select: (state: unknown) => unknown) =>
      select({ status, ensureAuthenticated }),
    { subscribe: () => () => {} }
  ),
}))

const { useAddressQuery } = await import("@/hooks/use-address-query")
const { replaceQuery } = await import("@/lib/preset-draft")
const { PresetCustomizeProvider } =
  await import("@/components/preset-customizer/preset-customize")
const { PresetCustomizeChat } =
  await import("@/components/preset-customizer/preset-customize-chat")
const { PresetCustomizePanel } =
  await import("@/components/preset-customizer/preset-customize-panel")
const { WorkspaceProvider } = await import("@/components/workspace")

const CODE = "b5dyaqxe6"
const OTHER = "b4YtS7GakV"
const ORANGE = { theme: "#CC5500", overrides: {} }
const BLUE = { theme: "#1D4ED8", overrides: {} }

let usage: { used: number; limit: number | null }
let sentBodies: Array<Record<string, unknown>>

beforeEach(() => {
  vi.clearAllMocks()
  sessionStorage.clear()
  status = "authenticated"
  usage = { used: 0, limit: null }
  sentBodies = []
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init?: RequestInit) => {
      if (url === "/api/assistant/chats/chat-1") {
        return new Response(
          JSON.stringify({
            chat: {
              id: "chat-1",
              messages: [
                { role: "user", kind: "text", content: "Use my brand blue" },
                {
                  role: "assistant",
                  kind: "text",
                  content: "Primary is your blue now.",
                },
              ],
            },
          })
        )
      }
      if (url === "/api/assistant/usage") {
        return new Response(JSON.stringify(usage))
      }
      if (url === "/api/assistant" && init?.method === "POST") {
        sentBodies.push(JSON.parse(String(init.body)))
        usage = { ...usage, used: usage.used + 1 }
        return new Response(
          JSON.stringify({
            phase: "custom",
            assistantMessage: "Primary is your blue now.",
            changed: ["theme"],
            customPreset: { presetCode: OTHER, colours: BLUE },
            chatId: "chat-1",
          })
        )
      }
      return new Response("{}", { status: 404 })
    })
  )
})

/** The preset page as far as the customizer goes: the code in the address. */
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

function renderAt(search: string, children: React.ReactNode) {
  window.history.replaceState(null, "", `/preset?preset=${CODE}${search}`)
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <Page>{children}</Page>
    </QueryClientProvider>
  )
}

async function ask(text: string) {
  fireEvent.change(screen.getByRole("textbox"), { target: { value: text } })
  await act(async () => {
    fireEvent.submit(screen.getByRole("textbox").closest("form")!)
  })
}

function query() {
  return new URLSearchParams(window.location.search)
}

const ORANGE_QUERY = `&colours=${encodeURIComponent(JSON.stringify(ORANGE))}`

describe("PresetCustomizeChat", () => {
  it("asks about the preset on show, and an answer changes it", async () => {
    renderAt(ORANGE_QUERY, <PresetCustomizeChat />)

    await ask("Use my brand blue")

    await screen.findByText("Primary is your blue now.")
    expect(sentBodies[0].customPreset).toEqual({
      presetCode: CODE,
      colours: ORANGE,
    })
    expect(query().get("preset")).toBe(OTHER)
    expect(JSON.parse(query().get("colours")!)).toEqual(BLUE)
    expect(query().get("chat")).toBe("chat-1")
  })

  it("opens the conversation the address names", async () => {
    renderAt("&chat=chat-1", <PresetCustomizeChat />)

    expect(await screen.findByText("Primary is your blue now.")).toBeTruthy()
  })

  it("lets go of it for a new chat", async () => {
    renderAt("&chat=chat-1", <PresetCustomizeChat />)
    await screen.findByText("Primary is your blue now.")

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /new chat/i }))
    })

    expect(query().has("chat")).toBe(false)
    expect(screen.queryByText("Primary is your blue now.")).toBeNull()
  })

  it("lets go of one that won't open", async () => {
    renderAt("&chat=someone-elses", <PresetCustomizeChat />)

    await waitFor(() => expect(query().has("chat")).toBe(false))
    expect(
      screen.getByRole("button", { name: "Use my brand blue #1D4ED8" })
    ).toBeTruthy()
  })

  it("says how many free generations are left", async () => {
    usage = { used: 1, limit: 3 }
    renderAt("", <PresetCustomizeChat />)

    await ask("Use my brand blue")

    expect(await screen.findByText("1 of 3 free left")).toBeTruthy()
  })

  it("shows Pro in the composer's place once they are used", async () => {
    usage = { used: 3, limit: 3 }
    renderAt("", <PresetCustomizeChat />)

    expect(await screen.findByText(/used your free generations/)).toBeTruthy()
    expect(screen.queryByRole("textbox")).toBeNull()
  })

  it("has someone signed out sign in first, keeping what they asked", async () => {
    status = "unauthenticated"
    usage = { used: 0, limit: 3 }
    renderAt("", <PresetCustomizeChat />)

    await ask("Use my brand blue")

    expect(ensureAuthenticated).toHaveBeenCalled()
    expect(sentBodies).toHaveLength(0)
    expect(sessionStorage.getItem("shadcnpreset:pendingAssistantPrompt")).toBe(
      "Use my brand blue"
    )
  })
})

describe("PresetCustomizeChat starters", () => {
  it("sends one as it reads", async () => {
    renderAt("", <PresetCustomizeChat />)

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: "Use my brand blue #1D4ED8" })
      )
    })

    await screen.findByText("Primary is your blue now.")
    expect(sentBodies[0].messages).toEqual([
      expect.objectContaining({ content: "Use my brand blue #1D4ED8" }),
    ])
    expect(
      screen.queryByRole("button", { name: "Use my brand blue #1D4ED8" })
    ).toBeNull()
  })

  it("has someone signed out sign in first, keeping the one they picked", async () => {
    status = "unauthenticated"
    renderAt("", <PresetCustomizeChat />)

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: "Use my brand blue #1D4ED8" })
      )
    })

    expect(ensureAuthenticated).toHaveBeenCalled()
    expect(sentBodies).toHaveLength(0)
    expect(sessionStorage.getItem("shadcnpreset:pendingAssistantPrompt")).toBe(
      "Use my brand blue #1D4ED8"
    )
  })
})

describe("PresetCustomizePanel with Ask AI", () => {
  const panel = (
    <WorkspaceProvider collapsible={false}>
      <PresetCustomizePanel chat={<PresetCustomizeChat />} />
    </WorkspaceProvider>
  )
  const selected = (name: string) =>
    screen.getByRole("tab", { name }).getAttribute("aria-selected")

  it("keeps the tab open in the address", async () => {
    renderAt("", panel)
    expect(selected("Controls")).toBe("true")

    fireEvent.click(screen.getByRole("tab", { name: "Ask AI" }))

    await waitFor(() => expect(selected("Ask AI")).toBe("true"))
    expect(query().get("tab")).toBe("ai")

    fireEvent.click(screen.getByRole("tab", { name: "Controls" }))

    await waitFor(() => expect(selected("Controls")).toBe("true"))
    expect(query().has("tab")).toBe(false)
  })

  it("opens on Ask AI, prompt in place, when back from signing in to send it", async () => {
    sessionStorage.setItem(
      "shadcnpreset:pendingAssistantPrompt",
      "Use my brand blue"
    )
    renderAt("&tab=ai", panel)

    expect(selected("Ask AI")).toBe("true")
    expect((screen.getByRole("textbox") as HTMLTextAreaElement).value).toBe(
      "Use my brand blue"
    )
  })
})
