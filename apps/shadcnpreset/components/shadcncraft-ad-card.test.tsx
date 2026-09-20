// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
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
      "https://shadcncraft.com?atp=shadcnpreset&src=assistant-chat"
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
