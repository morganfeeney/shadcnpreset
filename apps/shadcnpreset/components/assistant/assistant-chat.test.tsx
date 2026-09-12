// @vitest-environment jsdom
import * as React from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { act, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const CHAT_ID = "11111111-2222-4333-8444-555555555555"
const OTHER_CHAT_ID = "99999999-8888-4777-8666-555555555555"
/** What the client mints for a new chat: an id no chat has yet. */
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
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }))
const { toast } = await import("sonner")

const ensureAuthenticated = vi.fn(async () => true)
vi.mock("@/stores/auth-store", () => ({
  useAuthStore: (selector: (state: unknown) => unknown) =>
    selector({ status: "authenticated", ensureAuthenticated }),
}))

// These render a live preset in a sandboxed iframe, which none of this is
// about.
vi.mock("@/components/preset-style-overview-card", () => ({
  PresetStyleOverviewCard: ({ code }: { code: string }) => (
    <div data-testid="preset-card">{code}</div>
  ),
}))
vi.mock("@/components/assistant/assistant-preview-card", () => ({
  AssistantPreviewCard: () => <div data-testid="preview-card" />,
}))

const { AssistantChat } = await import("@/components/assistant/assistant-chat")
const { assistantChatPath } = await import("@/lib/assistant-chat-path")

const PRESETS = [
  { code: "aaa", description: "one" },
  { code: "bbb", description: "two" },
  { code: "ccc", description: "three" },
  { code: "ddd", description: "four" },
]

let failSend = false
let failChatDetail = false
/** Chats the fake server knows about, so an unknown id behaves like one. */
const storedChatIds = new Set<string>()
const chatDetailRequests: string[] = []

function mockFetch() {
  return vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : String(input)

    if (url === "/api/assistant" && init?.method === "POST") {
      if (failSend) {
        return new Response(
          JSON.stringify({ error: "The model is rate limiting." }),
          { status: 429 }
        )
      }
      const body = JSON.parse(String(init.body)) as {
        chatId?: string
        newChat?: boolean
      }
      // The real route refuses an id it cannot find unless the caller says it
      // is starting that chat, so that a stale client cannot silently
      // recreate a deleted conversation.
      const known = storedChatIds.has(body.chatId ?? "")
      if (body.chatId && !known && !body.newChat) {
        return new Response(
          JSON.stringify({
            error: "That chat no longer exists.",
            code: "chat_missing",
          }),
          { status: 404 }
        )
      }
      if (body.chatId) storedChatIds.add(body.chatId)
      return jsonResponse({
        phase: "ready",
        assistantMessage: "Four presets.",
        presets: PRESETS,
        chatId: body.chatId ?? CHAT_ID,
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

function renderPage(initialRoute: string | null = null) {
  window.history.replaceState(null, "", assistantChatPath(initialRoute))
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
    const chatId = href === "/assistant" ? null : (href.split("/").pop() ?? null)
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
  vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue(NEW_CHAT_ID)
  navigations.length = 0
  chatDetailRequests.length = 0
  failSend = false
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
  it("puts the chat in the URL as part of sending", async () => {
    renderPage()
    await sendPrompt("Orange presets")

    expect(navigations).toEqual([`/assistant/${NEW_CHAT_ID}`])
    await deliverNavigations()
    expect(window.location.pathname).toBe(`/assistant/${NEW_CHAT_ID}`)
    expect(screen.getAllByTestId("preset-card")).toHaveLength(4)
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
