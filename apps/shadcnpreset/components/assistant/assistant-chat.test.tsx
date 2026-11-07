// @vitest-environment jsdom
import * as React from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { act, render, screen, waitFor, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const CHAT_ID = "11111111-2222-4333-8444-555555555555"
const OTHER_CHAT_ID = "99999999-8888-4777-8666-555555555555"
/** What the server names a chat it has just created. */
const NEW_CHAT_ID = "abcdabcd-1234-4abc-8def-abcdefabcdef"

/**
 * App Router navigations are asynchronous: a link click returns straight away
 * and the page re-renders only once the payload lands. Navigations queue here
 * and each test decides when they arrive, which is what makes the window
 * between a click and the URL catching up testable at all.
 */
const navigations: string[] = []

// One object for the whole file, like the real `useRouter()`. A fresh one per
// render would re-run every effect that depends on it.
const router = {
  push: (href: string) => navigations.push(href),
  replace: (href: string) => navigations.push(href),
  prefetch: () => {},
  back: () => {},
  forward: () => {},
  refresh: () => {},
}

vi.mock("next/navigation", () => ({
  useRouter: () => router,
  usePathname: () => window.location.pathname,
  useParams: () => {
    const chatId = window.location.pathname.split("/")[2]
    return chatId ? { chatId: [chatId] } : {}
  },
}))

// A plain anchor: what matters is the href and that a click can be refused,
// not Next's prefetching.
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string
    children: React.ReactNode
  } & React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

vi.mock("@/lib/analytics-events", () => ({ trackEvent: vi.fn() }))
// The customizer is tested on its own; here the panel says what is open,
// as the address gives it.
vi.mock("@/components/assistant/assistant-preset-panel", () => ({
  AssistantPresetPanel: ({
    code,
    query,
    waiting,
    onClose,
  }: {
    code: string
    query: URLSearchParams
    waiting?: boolean
    onClose: () => void
  }) => (
    <div>
      <p>Preset {code}</p>
      {query.get("custom") ? <p>Saved {query.get("custom")}</p> : null}
      {waiting ? <p>Preview waiting for the slide</p> : null}
      <button type="button" onClick={onClose}>
        Close preset
      </button>
    </div>
  ),
}))
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }))
const { toast } = await import("sonner")

const ensureAuthenticated = vi.fn(async () => true)
vi.mock("@/stores/auth-store", () => ({
  useAuthStore: (selector: (state: unknown) => unknown) =>
    selector({ status: "authenticated", ensureAuthenticated }),
}))

// These render a live preset in a sandboxed iframe, which none of this is
// about.
vi.mock("@/components/preset-style-overview-card", async () => {
  const { usePresetCardCustomize } = await import(
    "@/components/preset-card-customize"
  )
  return {
    PresetStyleOverviewCard: function Card({ code }: { code: string }) {
      const inPlace = usePresetCardCustomize()
      return (
        <div data-testid="preset-card">
          {code}
          {inPlace ? (
            <button type="button" onClick={() => inPlace.customize(code)}>
              Customize {code}
            </button>
          ) : null}
        </div>
      )
    },
  }
})
vi.mock("@/components/assistant/assistant-preview-card", () => ({
  AssistantPreviewCard: () => <div data-testid="preview-card" />,
}))

const { AssistantChat } = await import("@/components/assistant/assistant-chat")
const { assistantChatPath } = await import("@/lib/assistant-chat-path")

const PRESETS = [
  { code: "b5dyaqxe6", description: "one" },
  { code: "b4YtS7GakV", description: "two" },
  { code: "b4xFeBLg4O", description: "three" },
  { code: "b1ePsKcQEb", description: "four" },
]
/** What the fake server's edit turns the open preset into. */
const EDITED_CODE = "b1VlItwW"

let failSend = false
/** The send answers that the free generations are used up. */
let proRequired = false
/** Held, the answer has not arrived yet. */
let releaseSend: (() => void) | null = null
let failChatDetail = false
/** Chats the fake server knows about, so an unknown id behaves like one. */
const storedChatIds = new Set<string>()
const chatDetailRequests: string[] = []
const sendBodies: Array<{
  chatId?: string
  customPreset?: { presetCode: string; colours: unknown }
}> = []

function mockFetch() {
  return vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : String(input)

    if (url === "/api/assistant" && init?.method === "POST") {
      if (proRequired) {
        return new Response(
          JSON.stringify({
            error: "You've used your 3 free generations.",
            code: "pro_required",
          }),
          { status: 402 }
        )
      }
      if (failSend) {
        return new Response(
          JSON.stringify({ error: "The model is rate limiting." }),
          { status: 429 }
        )
      }
      const body = JSON.parse(String(init.body)) as {
        chatId?: string
        customPreset?: { presetCode: string; colours: unknown }
        messages: { content: string }[]
      }
      sendBodies.push(body)
      if (releaseSend === null) {
        await new Promise<void>((resolve) => {
          releaseSend = resolve
        })
      }
      // An id the server does not know is a chat that has been deleted.
      if (body.chatId && !storedChatIds.has(body.chatId)) {
        return new Response(
          JSON.stringify({
            error: "That chat no longer exists.",
            code: "chat_missing",
          }),
          { status: 404 }
        )
      }
      // A chat is named when its first answer is ready, not before.
      const chatId = body.chatId ?? NEW_CHAT_ID
      storedChatIds.add(chatId)
      if (body.customPreset) {
        return jsonResponse({
          phase: "custom",
          assistantMessage: "Made the theme green.",
          changed: ["Theme: Green"],
          customPreset: { presetCode: EDITED_CODE, colours: { overrides: {} } },
          chatId,
        })
      }
      return jsonResponse({
        phase: "ready",
        assistantMessage: "Four presets.",
        presets: PRESETS,
        chatId,
      })
    }

    if (url === "/api/custom-presets/cp-9") {
      return jsonResponse({
        id: "cp-9",
        presetCode: PRESETS[2].code,
        colours: { overrides: {} },
        canEdit: true,
      })
    }

    if (url === "/api/assistant/chats") {
      return jsonResponse({
        chats: [
          { id: CHAT_ID, title: "First chat", createdAt: 2, updatedAt: 2 },
          { id: OTHER_CHAT_ID, title: "Second chat", createdAt: 1, updatedAt: 1 },
        ],
      })
    }

    if (url.startsWith("/api/assistant/chats/")) {
      const id = url.split("/").pop() as string
      chatDetailRequests.push(id)
      if (failChatDetail) {
        return new Response(JSON.stringify({ error: "nope" }), { status: 404 })
      }
      return jsonResponse({
        chat: {
          id,
          messages: [
            { role: "user", kind: "text", content: "Stored prompt" },
            {
              role: "assistant",
              kind: "presets",
              content: "Four presets.",
              presets: PRESETS,
            },
          ],
        },
      })
    }

    return jsonResponse({})
  })
}

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })
}

/** Re-render with the params unchanged, so only the URL has moved. */
const STALE_PARAMS = Symbol("stale params")

let applyNavigation: (next: string | null | typeof STALE_PARAMS) => void =
  () => {}

/** The page wired to the fake router, staying mounted across navigations. */
function Harness({ initialRoute }: { initialRoute: string | null }) {
  const [routeChatId, setRouteChatId] = React.useState(initialRoute)
  const [, setRenderTick] = React.useState(0)

  React.useEffect(() => {
    applyNavigation = (next) => {
      setRouteChatId((current) => (next === STALE_PARAMS ? current : next))
      setRenderTick((tick) => tick + 1)
    }
    return () => {
      applyNavigation = () => {}
    }
  }, [])

  // jsdom will not follow anchors, and a link the page refused must not reach
  // the queue, so this reads `defaultPrevented` before claiming it.
  React.useEffect(() => {
    function onClick(event: MouseEvent) {
      const anchor = (event.target as HTMLElement | null)?.closest?.("a")
      if (!anchor || event.defaultPrevented) return
      event.preventDefault()
      navigations.push(new URL(anchor.href, window.location.origin).pathname)
    }
    document.addEventListener("click", onClick)
    return () => document.removeEventListener("click", onClick)
  }, [])

  return <AssistantChat routeChatId={routeChatId} />
}

function renderPage(initialRoute: string | null = null, search = "") {
  window.history.replaceState(
    null,
    "",
    assistantChatPath(initialRoute) + search
  )
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <Harness initialRoute={initialRoute} />
    </QueryClientProvider>
  )
}

/**
 * Deliver every queued navigation in order, the way the router would.
 *
 * `staleParams` reproduces what Next does when returning to the page you just
 * left: the address bar moves and the page re-renders, with the params it
 * already had.
 */
async function deliverNavigations({ staleParams = false } = {}) {
  while (navigations.length) {
    const href = navigations.shift() as string
    window.history.pushState(null, "", href)
    const path = href.split("?")[0]
    const chatId = path === "/assistant" ? null : (path.split("/").pop() ?? null)
    await act(async () => {
      applyNavigation(staleParams ? STALE_PARAMS : chatId)
      await Promise.resolve()
    })
  }
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0))
  })
}

async function sendPrompt(text: string) {
  const composer = screen.getByRole("textbox")
  const form = composer.closest("form")
  if (!form) throw new Error("composer has no form")
  const setValue = Object.getOwnPropertyDescriptor(
    window.HTMLTextAreaElement.prototype,
    "value"
  )?.set
  await act(async () => {
    setValue?.call(composer, text)
    composer.dispatchEvent(new Event("input", { bubbles: true }))
  })
  await act(async () => {
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }))
  })
  // The hook drops a send while a chat is hydrating; say so here rather than
  // leaving the assertions to puzzle over a turn that never happened.
  await waitFor(() => {
    expect(screen.getAllByText(text).length).toBeGreaterThan(0)
  })
}

function clickLink(href: string) {
  const link = screen
    .getAllByRole("link")
    .find((candidate) => candidate.getAttribute("href") === href)
  if (!link) throw new Error(`no link to ${href}`)
  return act(async () => {
    link.dispatchEvent(
      new window.MouseEvent("click", { bubbles: true, cancelable: true })
    )
  })
}

beforeEach(() => {
  navigations.length = 0
  chatDetailRequests.length = 0
  sendBodies.length = 0
  failSend = false
  proRequired = false
  releaseSend = () => {}
  // Shared across tests, so a later assertion could otherwise pass on an
  // earlier test's toast.
  vi.mocked(toast.error).mockClear()
  storedChatIds.clear()
  storedChatIds.add(CHAT_ID)
  storedChatIds.add(OTHER_CHAT_ID)
  failChatDetail = false
  window.history.replaceState(null, "", "/assistant")
  vi.stubGlobal("fetch", mockFetch())
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe("AssistantChat URLs", () => {
  it("leaves the address bar alone until there is an answer to come back to", async () => {
    // Hold the answer: this is the several seconds a person spends watching
    // their question sit there.
    releaseSend = null
    renderPage()
    const composer = screen.getByRole("textbox")
    const form = composer.closest("form") as HTMLFormElement
    const setValue = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      "value"
    )?.set
    await act(async () => {
      setValue?.call(composer, "Orange presets")
      composer.dispatchEvent(new Event("input", { bubbles: true }))
    })
    await act(async () => {
      form.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true })
      )
    })

    await waitFor(() => expect(sendBodies).toHaveLength(1))
    // No id goes up, because there is no chat yet — and nothing moves.
    expect(sendBodies[0]).not.toHaveProperty("chatId")
    expect(navigations).toEqual([])
    expect(window.location.pathname).toBe("/assistant")

    await act(async () => {
      ;(releaseSend as unknown as () => void)?.()
      await new Promise((resolve) => setTimeout(resolve, 0))
    })

    await waitFor(() => {
      expect(screen.getAllByTestId("preset-card")).toHaveLength(4)
    })
    // Now there is something to come back to.
    expect(navigations).toEqual([`/assistant/${NEW_CHAT_ID}`])
    await deliverNavigations()
    expect(window.location.pathname).toBe(`/assistant/${NEW_CHAT_ID}`)
  })

  it("opens the chat the URL names on a cold load", async () => {
    renderPage(CHAT_ID)

    await waitFor(() => {
      expect(screen.getAllByTestId("preset-card")).toHaveLength(4)
    })
    expect(chatDetailRequests).toContain(CHAT_ID)
  })

  it("offers every chat as a link to its own address", async () => {
    renderPage()

    await waitFor(() => {
      expect(
        screen.getAllByRole("link").map((l) => l.getAttribute("href"))
      ).toContain(`/assistant/${OTHER_CHAT_ID}`)
    })
    expect(
      screen.getAllByRole("link").map((l) => l.getAttribute("href"))
    ).toContain("/assistant")
  })

  it("starts a new chat from the New chat link", async () => {
    renderPage(CHAT_ID)
    await waitFor(() => {
      expect(screen.getAllByTestId("preset-card")).toHaveLength(4)
    })

    await clickLink("/assistant")
    await deliverNavigations()

    expect(window.location.pathname).toBe("/assistant")
    expect(screen.queryAllByTestId("preset-card")).toHaveLength(0)
  })

  it("starts a new chat right after creating one, before the URL catches up", async () => {
    // The composer is free the moment the reply renders, which can be before
    // the navigation the send started has landed. This is the click that used
    // to do nothing at all.
    renderPage()
    await sendPrompt("Orange presets")
    await waitFor(() => {
      expect(screen.getAllByTestId("preset-card")).toHaveLength(4)
    })

    await clickLink("/assistant")
    await deliverNavigations()

    expect(window.location.pathname).toBe("/assistant")
    expect(screen.queryAllByTestId("preset-card")).toHaveLength(0)
  })

  it("opens the chat the URL names even when the page params do not follow", async () => {
    renderPage(CHAT_ID)
    await waitFor(() => {
      expect(screen.getAllByTestId("preset-card")).toHaveLength(4)
    })

    await clickLink("/assistant")
    await deliverNavigations({ staleParams: true })
    expect(screen.queryAllByTestId("preset-card")).toHaveLength(0)

    await clickLink(`/assistant/${CHAT_ID}`)
    await deliverNavigations({ staleParams: true })

    expect(window.location.pathname).toBe(`/assistant/${CHAT_ID}`)
    await waitFor(() => {
      expect(screen.getAllByTestId("preset-card")).toHaveLength(4)
    })
  })

  it("does not read back a chat it has just written", async () => {
    renderPage()
    await sendPrompt("Orange presets")
    await waitFor(() => {
      expect(screen.getAllByTestId("preset-card")).toHaveLength(4)
    })
    await deliverNavigations()

    // The conversation on screen is what was just persisted, so re-reading it
    // can only return the same thing — or miss a write that has not landed
    // and report the chat as gone.
    expect(chatDetailRequests).not.toContain(NEW_CHAT_ID)
  })

  it("reports a failed send as a toast", async () => {
    failSend = true
    renderPage()

    const composer = screen.getByRole("textbox")
    const form = composer.closest("form") as HTMLFormElement
    const setValue = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      "value"
    )?.set
    await act(async () => {
      setValue?.call(composer, "Orange presets")
      composer.dispatchEvent(new Event("input", { bubbles: true }))
    })
    await act(async () => {
      form.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true })
      )
    })

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "The model is rate limiting.",
        expect.anything()
      )
    })
    expect(screen.queryByRole("alert")).toBeNull()
  })

  it("hands back the new-chat page when a chat will not load", async () => {
    failChatDetail = true
    renderPage(CHAT_ID)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled()
    })
    await deliverNavigations()

    expect(window.location.pathname).toBe("/assistant")
    expect(screen.queryAllByTestId("preset-card")).toHaveLength(0)
  })
})

describe("AssistantChat sponsored card", () => {
  it("waits for an answer before showing the shadcncraft card", async () => {
    // Held: the question is on screen and the reply is still coming.
    releaseSend = null
    renderPage()
    expect(screen.queryByRole("complementary", { name: "Sponsored" })).toBeNull()

    const composer = screen.getByRole("textbox")
    const form = composer.closest("form") as HTMLFormElement
    const setValue = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      "value"
    )?.set
    await act(async () => {
      setValue?.call(composer, "Orange presets")
      composer.dispatchEvent(new Event("input", { bubbles: true }))
    })
    await act(async () => {
      form.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true })
      )
    })

    await waitFor(() => expect(sendBodies).toHaveLength(1))
    expect(screen.queryByRole("complementary", { name: "Sponsored" })).toBeNull()

    await act(async () => {
      ;(releaseSend as unknown as () => void)?.()
      await new Promise((resolve) => setTimeout(resolve, 0))
    })

    const card = await screen.findByRole("complementary", { name: "Sponsored" })
    expect(
      within(card).getByRole("link").getAttribute("href")
    ).toBe("https://shadcncraft.com?atp=shadcnpreset&sub1=assistant-chat")
  })
})

/** Customize on that preset's card in the latest answer. */
async function customize(code: string) {
  const buttons = await screen.findAllByRole("button", {
    name: `Customize ${code}`,
  })
  await act(async () => {
    buttons.at(-1)!.dispatchEvent(new MouseEvent("click", { bubbles: true }))
  })
}

/** Anything saved: customizing from a card never saves. */
function customPresetRequests() {
  return vi
    .mocked(fetch)
    .mock.calls.filter(([url]) => String(url).startsWith("/api/custom-presets"))
}

function address() {
  return new URLSearchParams(window.location.search)
}

describe("AssistantChat customizing a preset", () => {
  it("shows the preset whose card was clicked, in the chat's colours, saving nothing", async () => {
    renderPage()
    await sendPrompt("A preset with #0876BD as base color")
    await sendPrompt("make it bolder")

    await customize(PRESETS[1].code)

    expect(await screen.findByText(`Preset ${PRESETS[1].code}`)).toBeTruthy()
    expect(address().get("preset")).toBe(PRESETS[1].code)
    expect(address().get("colours")).toContain("#0876BD")
    expect(customPresetRequests()).toEqual([])
  })

  it("shows it as it comes when the chat gave no exact colours", async () => {
    renderPage()
    await sendPrompt("Orange presets")

    await customize(PRESETS[0].code)

    expect(await screen.findByText(`Preset ${PRESETS[0].code}`)).toBeTruthy()
    expect(address().has("colours")).toBe(false)
  })

  it("switches in place to another card, without a step of its own", async () => {
    renderPage()
    await sendPrompt("Orange presets")
    await customize(PRESETS[0].code)
    await screen.findByText(`Preset ${PRESETS[0].code}`)
    const steps = window.history.length

    await customize(PRESETS[1].code)

    expect(await screen.findByText(`Preset ${PRESETS[1].code}`)).toBeTruthy()
    expect(window.history.length).toBe(steps)
    expect(customPresetRequests()).toEqual([])
  })

  it("keeps the sponsored card under presets, exact colours or not", async () => {
    renderPage()
    await sendPrompt("A preset with #0876BD as base color")

    expect(
      await screen.findByRole("complementary", { name: "Sponsored" })
    ).toBeTruthy()
    expect(
      screen.queryByRole("complementary", { name: "Custom preset" })
    ).toBeNull()
  })
})

describe("AssistantChat Pro wall", () => {
  it("puts the question back and shows Pro in the composer's place", async () => {
    proRequired = true
    renderPage()
    const composer = screen.getByRole("textbox")
    const form = composer.closest("form") as HTMLFormElement
    const setValue = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      "value"
    )?.set
    await act(async () => {
      setValue?.call(composer, "Orange presets")
      composer.dispatchEvent(new Event("input", { bubbles: true }))
    })
    await act(async () => {
      form.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true })
      )
    })

    const wall = await screen.findByRole("complementary", { name: "Pro" })
    expect(
      within(wall).getByText("You’ve used your free generations")
    ).toBeTruthy()
    expect(screen.queryByRole("textbox")).toBeNull()
    expect(toast.error).not.toHaveBeenCalled()
  })
})

describe("AssistantChat preset panel", () => {
  function panel() {
    return screen.getByRole("region", { name: "Custom preset", hidden: true })
  }

  async function openFromCard() {
    await sendPrompt("A preset with #0876BD as base color")
    await customize(PRESETS[0].code)
    await screen.findByText(`Preset ${PRESETS[0].code}`)
  }

  async function close() {
    await act(async () => {
      screen.getByRole("button", { name: "Close preset" }).click()
    })
  }

  it("opens beside the chat, and in the address", async () => {
    renderPage()
    await openFromCard()

    expect(panel().hasAttribute("data-open")).toBe(true)
    expect(address().get("preset")).toBe(PRESETS[0].code)
  })

  it("closes, and the address lets it go", async () => {
    renderPage()
    await openFromCard()

    await close()

    expect(panel().hasAttribute("data-open")).toBe(false)
    expect(window.location.search).toBe("")
  })

  it("holds the preview until the panel has slid in", async () => {
    let slidIn = () => {}
    const finished = new Promise<void>((resolve) => {
      slidIn = resolve
    })
    // jsdom runs no transitions; this one is the panel's slide.
    HTMLElement.prototype.getAnimations = () => [
      { finished } as unknown as Animation,
    ]
    try {
      renderPage()
      await openFromCard()

      expect(
        await screen.findByText("Preview waiting for the slide")
      ).toBeTruthy()
      await act(async () => slidIn())
      expect(screen.queryByText("Preview waiting for the slide")).toBeNull()
    } finally {
      delete (HTMLElement.prototype as Partial<HTMLElement>).getAnimations
    }
  })

  it("opens the one the address names on arrival, without the slide", async () => {
    renderPage(CHAT_ID, `?preset=${PRESETS[3].code}`)

    expect(await screen.findByText(`Preset ${PRESETS[3].code}`)).toBeTruthy()
    expect(panel().hasAttribute("data-open")).toBe(true)
    expect(panel().hasAttribute("data-instant")).toBe(true)
  })

  it("opens an older link to a saved preset by that preset", async () => {
    renderPage(CHAT_ID, "?preset=cp-9")

    expect(await screen.findByText(`Preset ${PRESETS[2].code}`)).toBeTruthy()
    expect(screen.getByText("Saved cp-9")).toBeTruthy()
  })

  it("sends the open preset with a message, and asks for changes to it", async () => {
    renderPage()
    await openFromCard()

    expect(screen.getByRole("textbox").getAttribute("placeholder")).toBe(
      "Ask for changes to this preset…"
    )
    const colours = JSON.parse(address().get("colours")!)
    await sendPrompt("make it green")

    await waitFor(() => expect(sendBodies).toHaveLength(2))
    expect(sendBodies[0].customPreset).toBeUndefined()
    expect(sendBodies[1].customPreset).toEqual({
      presetCode: PRESETS[0].code,
      colours,
    })
  })

  it("shows the edit in the chat and the panel", async () => {
    renderPage()
    await openFromCard()

    await sendPrompt("make it green")

    expect(await screen.findByText("Made the theme green.")).toBeTruthy()
    expect(await screen.findByText(`Preset ${EDITED_CODE}`)).toBeTruthy()
    expect(address().has("colours")).toBe(false)
  })

  it("goes back to finding presets once the panel closes", async () => {
    renderPage()
    await openFromCard()
    await close()

    await sendPrompt("something warmer")

    await waitFor(() => expect(sendBodies).toHaveLength(2))
    expect(sendBodies[1].customPreset).toBeUndefined()
  })
})

describe("AssistantChat asked for a custom preset", () => {
  const ASK = "I want a custom preset using burnt orange"

  it("answers with presets to customize, without opening one", async () => {
    renderPage()
    await sendPrompt(ASK)

    expect(
      await screen.findByRole("button", { name: `Customize ${PRESETS[0].code}` })
    ).toBeTruthy()
    expect(
      screen
        .getByRole("region", { name: "Custom preset", hidden: true })
        .hasAttribute("data-open")
    ).toBe(false)
    expect(customPresetRequests()).toEqual([])
  })
})
