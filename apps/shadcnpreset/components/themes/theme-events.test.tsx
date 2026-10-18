// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { ThemeCopyActions } from "@/components/themes/theme-copy-actions"
import { setThemeFonts } from "@/components/themes/theme-fonts"
import { ThemeSidebar } from "@/components/themes/theme-nav"
import { trackEvent } from "@/lib/analytics-events"
import { presetThemeFromSlug, presetThemeSummary } from "@/lib/preset-themes"

vi.mock("@/lib/analytics-events", () => ({ trackEvent: vi.fn() }))

const lime = presetThemeFromSlug("lime-on-mist")!
const teal = presetThemeFromSlug("teal-on-mist")!
const items = [lime, teal].map(presetThemeSummary)

afterEach(() => {
  cleanup()
  vi.mocked(trackEvent).mockClear()
  vi.useRealTimers()
  setThemeFonts(null)
})

describe("theme search", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  function search(value: string) {
    fireEvent.change(screen.getByRole("searchbox", { name: "Search themes" }), {
      target: { value },
    })
  }

  function searches() {
    return vi
      .mocked(trackEvent)
      .mock.calls.filter(([name]) => name === "theme_search")
  }

  it("reports a search once typing pauses", () => {
    render(<ThemeSidebar items={items} currentSlug={lime.slug} />)

    search("li")
    act(() => vi.advanceTimersByTime(400))
    search("lime")
    act(() => vi.advanceTimersByTime(1000))

    expect(searches()).toEqual([
      [
        "theme_search",
        {
          placement: "sidebar",
          search_term: "lime",
          base_color: undefined,
          result_count: 1,
        },
      ],
    ])
  })

  it("reports the same search again only after it was cleared", () => {
    render(<ThemeSidebar items={items} currentSlug={lime.slug} />)

    search("teal")
    act(() => vi.advanceTimersByTime(1000))
    search("teal ")
    act(() => vi.advanceTimersByTime(1000))
    expect(searches()).toHaveLength(1)

    search("")
    act(() => vi.advanceTimersByTime(1000))
    search("teal")
    act(() => vi.advanceTimersByTime(1000))
    expect(searches()).toHaveLength(2)
  })
})

describe("theme copy", () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    })
  })

  async function copyCommand() {
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Copy command/ }))
    })
  }

  it("says whether the copied command includes fonts", async () => {
    render(
      <ThemeCopyActions themeSlug={lime.slug} code={lime.code} css={lime.css} />
    )

    await copyCommand()
    act(() => setThemeFonts({ heading: "merriweather", body: "inter" }))
    await copyCommand()

    expect(vi.mocked(trackEvent).mock.calls).toEqual([
      [
        "theme_copy",
        { theme_slug: lime.slug, kind: "command", with_fonts: "no" },
      ],
      [
        "theme_copy",
        { theme_slug: lime.slug, kind: "command", with_fonts: "yes" },
      ],
    ])
  })
})
