// @vitest-environment jsdom
import { act, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  FloatingSponsorCard,
  SiteFloatingSponsorCard,
} from "@/components/floating-sponsor-card"
import { SPONSORS } from "@/components/sponsors"
import { trackEvent } from "@/lib/analytics-events"

vi.mock("@/lib/analytics-events", () => ({ trackEvent: vi.fn() }))

const pathname = vi.hoisted(() => ({ current: "/" }))
vi.mock("next/navigation", () => ({ usePathname: () => pathname.current }))

const sponsor = SPONSORS[0]

function setWide(wide: boolean) {
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query) =>
      ({
        matches: wide,
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
      }) as unknown as MediaQueryList
  )
}

function scrollTo(y: number) {
  act(() => {
    Object.defineProperty(window, "scrollY", { configurable: true, value: y })
    window.dispatchEvent(new Event("scroll"))
  })
}

function card() {
  return document.querySelector("aside[aria-label=Sponsored]")
}

function impressions() {
  return vi
    .mocked(trackEvent)
    .mock.calls.filter(([name]) => name === "affiliate_impression")
}

beforeEach(() => {
  setWide(true)
  scrollTo(0)
  window.localStorage.clear()
  pathname.current = "/"
})

afterEach(() => {
  vi.mocked(trackEvent).mockClear()
  vi.restoreAllMocks()
  vi.useRealTimers()
  document.body.innerHTML = ""
})

describe("FloatingSponsorCard", () => {
  it("opens once the reader is a screen down, counting one impression", () => {
    render(<FloatingSponsorCard sponsor={sponsor} placement="floating-learn" />)

    expect(card()?.getAttribute("data-state")).toBe("closed")
    expect(impressions()).toHaveLength(0)

    scrollTo(window.innerHeight)
    expect(card()?.getAttribute("data-state")).toBe("open")

    // Back at the top it stays: the reader has already been shown it.
    scrollTo(0)
    expect(card()?.getAttribute("data-state")).toBe("open")
    scrollTo(window.innerHeight * 2)
    expect(impressions()).toEqual([
      [
        "affiliate_impression",
        { partner: "shadcncraft", placement: "floating-learn" },
      ],
    ])
  })

  it("opens after a few seconds when the reader does not scroll", () => {
    vi.useFakeTimers()
    render(<FloatingSponsorCard sponsor={sponsor} placement="floating-preset" />)

    act(() => vi.advanceTimersByTime(4900))
    expect(card()?.getAttribute("data-state")).toBe("closed")

    act(() => vi.advanceTimersByTime(100))
    expect(card()?.getAttribute("data-state")).toBe("open")
    expect(impressions()).toHaveLength(1)
  })

  it("waits for a background tab to be shown before opening", () => {
    vi.useFakeTimers()
    vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden")
    render(<FloatingSponsorCard sponsor={sponsor} placement="floating-preset" />)

    act(() => vi.advanceTimersByTime(10_000))
    expect(card()?.getAttribute("data-state")).toBe("closed")
    expect(impressions()).toHaveLength(0)

    vi.spyOn(document, "visibilityState", "get").mockReturnValue("visible")
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"))
    })
    expect(card()?.getAttribute("data-state")).toBe("open")
  })

  it("rises to sit above the footer instead of covering it", () => {
    const footer = document.createElement("footer")
    document.body.append(footer)
    let footerTop = window.innerHeight + 500
    footer.getBoundingClientRect = () => ({ top: footerTop }) as DOMRect
    render(<FloatingSponsorCard sponsor={sponsor} placement="floating-learn" />)
    scrollTo(window.innerHeight)
    expect((card() as HTMLElement).style.bottom).toBe("16px")

    footerTop = window.innerHeight - 200
    scrollTo(window.innerHeight * 2)

    expect((card() as HTMLElement).style.bottom).toBe("216px")
    expect(card()?.getAttribute("data-state")).toBe("open")
  })

  it("stays closed for this sponsor once dismissed", () => {
    const { unmount } = render(
      <FloatingSponsorCard sponsor={sponsor} placement="floating-learn" />
    )
    scrollTo(window.innerHeight)

    fireEvent.click(screen.getByRole("button", { name: "Hide ad" }))

    expect(card()).toBeNull()
    expect(trackEvent).toHaveBeenLastCalledWith("affiliate_dismiss", {
      partner: "shadcncraft",
      placement: "floating-learn",
    })

    unmount()
    render(<FloatingSponsorCard sponsor={sponsor} placement="floating-home" />)
    expect(card()).toBeNull()
  })

  it("does not float or count on narrow screens", () => {
    setWide(false)
    render(<FloatingSponsorCard sponsor={sponsor} placement="floating-learn" />)
    scrollTo(window.innerHeight)

    expect(card()).toBeNull()
    expect(impressions()).toHaveLength(0)
  })
})

describe("SiteFloatingSponsorCard", () => {
  it("names the placement after the page's section", () => {
    pathname.current = "/learn/how-to-choose-a-shadcn-style"
    render(<SiteFloatingSponsorCard />)

    expect(screen.getByRole("link").getAttribute("href")).toBe(
      "https://shadcncraft.com?atp=shadcnpreset&sub1=floating-learn"
    )
  })

  it("calls the home page home", () => {
    render(<SiteFloatingSponsorCard />)

    expect(screen.getByRole("link").getAttribute("href")).toContain(
      "sub1=floating-home"
    )
  })

  it("leaves out preset previews, which load inside other pages", () => {
    pathname.current = "/preset-preview/cards-1"
    render(<SiteFloatingSponsorCard />)

    expect(card()).toBeNull()
  })
})
