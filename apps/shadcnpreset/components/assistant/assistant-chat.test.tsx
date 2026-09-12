// @vitest-environment jsdom
import * as React from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { act, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const CHAT_ID = "11111111-2222-4333-8444-555555555555"

/**
 * App Router navigations are asynchronous: `push`/`replace` return straight
 * away and the page re-renders only once the payload lands. Navigations queue
 * here and a test decides when they arrive, which is what makes the window
 * between a click and the URL catching up testable at all.
 */
const navigations: string[] = []

// One object for the whole test, like the real `useRouter()`: a fresh one per
// render would re-run every effect that depends on it and hide ordering bugs
// behind repeated navigations.
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
  // Next keeps this in step with the native history methods.
  usePathname: () => window.location.pathname,
}))

// A plain anchor: what matters here is the href and that a click on it can be
// refused, not Next's prefetching.
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

/**
 * Held open, the chat-list refetch stands in for the invalidation a send
 * kicks off. That query has an observer, so `invalidateQueries` waits on it;
 * the chat-detail query has none yet and would resolve straight away.
 */
let failChatDetail = false
let releaseChatList: (() => void) | null = null
let holdChatListFromCall = Number.POSITIVE_INFINITY
let chatListCalls = 0

function mockFetch() {
  return vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : String(input)

    if (url === "/api/assistant" && init?.method === "POST") {
      return jsonResponse({
        phase: "ready",
        assistantMessage: "Four orange presets.",
        presets: PRESETS,
        chatId: CHAT_ID,
      })
    }

    if (url === "/api/assistant/chats") {
      chatListCalls += 1
      if (chatListCalls >= holdChatListFromCall) {
        await new Promise<void>((resolve) => {
          releaseChatList = resolve
        })
      }
      return jsonResponse({
        chats: [
          { id: CHAT_ID, title: "Orange presets", createdAt: 1, updatedAt: 1 },
        ],
      })
    }

    if (url.startsWith("/api/assistant/chats/")) {
      if (failChatDetail) {
        return new Response(JSON.stringify({ error: "nope" }), { status: 404 })
      }
      return jsonResponse({
        chat: {
          id: CHAT_ID,
          messages: [
            { role: "user", kind: "text", content: "Orange presets" },
            {
              role: "assistant",
              kind: "presets",
              content: "Four orange presets.",
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

/** The page wired to the fake router, staying mounted across navigations. */
function Harness({ initialRoute }: { initialRoute: string | null }) {
  const [routeChatId, setRouteChatId] = React.useState(initialRoute)
  const [, setRenderTick] = React.useState(0)
  // Hand the route setter to the test while mounted, so a delivered
  // navigation can re-render the page the way the segment would.
  React.useEffect(() => {
    applyNavigations = (next) => {
      // A re-render either way; only a real param change moves this state.
      setRouteChatId((current) => (next === STALE_PARAMS ? current : next))
      setRenderTick((tick) => tick + 1)
    }
    return () => {
      applyNavigations = () => {}
    }
  }, [])
  // Anchors: jsdom will not follow them, and a link the page refused must not
  // reach the queue, so this reads `defaultPrevented` before claiming it.
  React.useEffect(() => {
    function onClick(event: MouseEvent) {
      const anchor = (event.target as HTMLElement | null)?.closest?.("a")
      if (!anchor) return
      if (event.defaultPrevented) return
      event.preventDefault()
      navigations.push(new URL(anchor.href, window.location.origin).pathname)
    }
    document.addEventListener("click", onClick)
    return () => document.removeEventListener("click", onClick)
  }, [])
  return <AssistantChat routeChatId={routeChatId} />
}

/** Re-render with the params unchanged, so only the URL has moved. */
const STALE_PARAMS = Symbol("stale params")

let applyNavigations: (next: string | null | typeof STALE_PARAMS) => void =
  () => {}

function renderPage(initialRoute: string | null = null) {
  // The address bar is where the page reads the open chat from, so a render
  // at a chat route has to start at that chat's URL.
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
 * Deliver every queued navigation in order, the way the router would, and let
 * the renders and any follow-up effects settle.
 *
 * `staleParams` reproduces what Next does when returning to the chat you just
 * left: the address bar moves and the page re-renders, with the params it
 * already had.
 */
async function deliverNavigations({ staleParams = false } = {}) {
  while (navigations.length) {
    const href = navigations.shift() as string
    window.history.pushState(null, "", href)
    const chatId = href === "/assistant" ? null : (href.split("/").pop() ?? null)
    await act(async () => {
      applyNavigations(staleParams ? STALE_PARAMS : chatId)
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
  // The hook drops a send while a chat is still hydrating. Say so here rather
  // than letting the assertions puzzle over a turn that never happened.
  await waitFor(() => {
    // `getAllBy`: the sidebar names chats after their first prompt, so the
    // same words can be on screen twice.
    expect(screen.getAllByText(text).length).toBeGreaterThan(0)
  })
}

function clickNewChat() {
  const link = screen.getByRole("link", { name: /new chat/i })
  return act(async () => {
    link.dispatchEvent(
      new window.MouseEvent("click", { bubbles: true, cancelable: true })
    )
  })
}

beforeEach(() => {
  // The client mints the chat id now, so pin it.
  vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue(CHAT_ID)
  navigations.length = 0
  window.history.replaceState(null, "", "/assistant")
  releaseChatList = null
  failChatDetail = false
  holdChatListFromCall = Number.POSITIVE_INFINITY
  chatListCalls = 0
  vi.stubGlobal("fetch", mockFetch())
})

afterEach(() => {
  releaseChatList?.()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe("AssistantChat", () => {
  it("navigates to the new chat as part of sending", async () => {
    renderPage()
    await sendPrompt("Orange presets")

    // At send time, not once the reply came back.
    expect(navigations).toEqual([`/assistant/${CHAT_ID}`])
    await deliverNavigations()
    expect(window.location.pathname).toBe(`/assistant/${CHAT_ID}`)
    expect(screen.getAllByTestId("preset-card")).toHaveLength(4)
  })

  it("drops the waiting placeholder as soon as the presets render", async () => {
    // The refetch the send kicks off never comes back. The answer is on
    // screen, so the waiting state must not outlive it.
    holdChatListFromCall = 2
    renderPage()
    await waitFor(() => expect(chatListCalls).toBe(1))
    await sendPrompt("Orange presets")

    await waitFor(() => {
      expect(screen.getAllByTestId("preset-card")).toHaveLength(4)
    })
    expect(screen.queryByText(/generating presets/i)).toBeNull()
  })

  it("starts a new chat when New chat is clicked after a send", async () => {
    renderPage(CHAT_ID)
    // Wait for the stored chat to land: a send before that is dropped.
    await waitFor(() => {
      expect(screen.getAllByTestId("preset-card")).toHaveLength(4)
    })
    // Four from the stored chat, four from the reply.
    await sendPrompt("More like these")
    await waitFor(() => {
      expect(screen.getAllByTestId("preset-card")).toHaveLength(8)
    })
    await deliverNavigations()

    await clickNewChat()
    await deliverNavigations()

    expect(window.location.pathname).toBe("/assistant")
    expect(screen.queryAllByTestId("preset-card")).toHaveLength(0)
  })

  it("opens the chat the URL names even when the page params do not follow", async () => {
    // Load a chat, leave it for the new-chat page, then go back into it. The
    // URL is the only thing that moves on that last step.
    renderPage(CHAT_ID)
    await waitFor(() => {
      expect(screen.getAllByTestId("preset-card")).toHaveLength(4)
    })

    await clickNewChat()
    await deliverNavigations({ staleParams: true })
    expect(screen.queryAllByTestId("preset-card")).toHaveLength(0)

    await act(async () => {
      screen
        .getAllByRole("link")
        .find((link) => link.getAttribute("href") === `/assistant/${CHAT_ID}`)
        ?.dispatchEvent(
          new window.MouseEvent("click", { bubbles: true, cancelable: true })
        )
    })
    await deliverNavigations({ staleParams: true })

    expect(window.location.pathname).toBe(`/assistant/${CHAT_ID}`)
    await waitFor(() => {
      expect(screen.getAllByTestId("preset-card")).toHaveLength(4)
    })
  })

  it("takes a chat that will not load back out of the URL", async () => {
    // Reset to the new-chat page but leave its id in the address bar and the
    // chat is unreachable: the route prop never changes again, so nothing
    // reopens it and even clicking its row is a navigation to where the URL
    // already says we are.
    failChatDetail = true
    renderPage(CHAT_ID)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled()
    })
    await deliverNavigations()

    expect(window.location.pathname).toBe("/assistant")
    expect(screen.queryAllByTestId("preset-card")).toHaveLength(0)
  })

  it("does not reopen the chat when New chat is clicked before the send's navigation lands", async () => {
    // The composer is free the moment the reply renders, which can be before
    // the navigation the send started has arrived. Both are ordinary
    // navigations now, so the last one the user asked for is where this ends.
    renderPage()
    await sendPrompt("Orange presets")
    await waitFor(() => {
      expect(screen.getAllByTestId("preset-card")).toHaveLength(4)
    })

    await clickNewChat()
    await deliverNavigations()

    expect(window.location.pathname).toBe("/assistant")
    expect(screen.queryAllByTestId("preset-card")).toHaveLength(0)
  })
})
