// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { ShadcncraftAdCard } from "@/components/shadcncraft-ad-card"
import { trackEvent } from "@/lib/analytics-events"

vi.mock("@/lib/analytics-events", () => ({ trackEvent: vi.fn() }))

afterEach(() => {
  cleanup()
  vi.mocked(trackEvent).mockClear()
})

describe("ShadcncraftAdCard", () => {
  it("links to shadcncraft with our affiliate tag and the placement", () => {
    render(<ShadcncraftAdCard placement="assistant-chat" />)

    const link = screen.getByRole("link")
    expect(link.getAttribute("href")).toBe(
      "https://shadcncraft.com?atp=shadcnpreset&sub1=assistant-chat"
    )
    expect(link.getAttribute("rel")).toContain("sponsored")
  })

  it("records the impression it was shown for, and the click", () => {
    render(<ShadcncraftAdCard placement="assistant-chat" />)

    expect(trackEvent).toHaveBeenCalledWith("affiliate_impression", {
      partner: "shadcncraft",
      placement: "assistant-chat",
    })

    fireEvent.click(screen.getByRole("link"))

    expect(trackEvent).toHaveBeenLastCalledWith("affiliate_click", {
      partner: "shadcncraft",
      placement: "assistant-chat",
    })
  })

  it("waits until it is on screen when asked to count when seen", () => {
    let report: IntersectionObserverCallback = () => {}
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(callback: IntersectionObserverCallback) {
          report = callback
        }
        observe() {}
        disconnect() {}
      }
    )
    render(<ShadcncraftAdCard placement="learn-end" countWhenSeen />)
    expect(trackEvent).not.toHaveBeenCalled()

    act(() => {
      report(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver
      )
    })
    expect(trackEvent).toHaveBeenCalledWith("affiliate_impression", {
      partner: "shadcncraft",
      placement: "learn-end",
    })
    vi.unstubAllGlobals()
  })

  it("counts an impression per conversation, not per render", () => {
    const { rerender } = render(
      <ShadcncraftAdCard placement="assistant-chat" impressionKey="chat-1" />
    )
    rerender(
      <ShadcncraftAdCard placement="assistant-chat" impressionKey="chat-1" />
    )
    expect(trackEvent).toHaveBeenCalledTimes(1)

    rerender(
      <ShadcncraftAdCard placement="assistant-chat" impressionKey="chat-2" />
    )
    expect(trackEvent).toHaveBeenCalledTimes(2)
  })
})
