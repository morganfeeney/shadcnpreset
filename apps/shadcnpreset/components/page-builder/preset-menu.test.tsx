// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  DEFAULT_PRESET,
  PresetMenu,
} from "@/components/page-builder/preset-menu"

const vote = vi.hoisted(() => ({
  toggleVote: vi.fn(),
  hasVoted: false,
  codes: [] as string[],
}))

// Saving is a vote: useVote owns signing in and the request; this only
// checks which preset the save button hands it.
vi.mock("@/hooks/use-vote", () => ({
  default: (code: string) => {
    vote.codes.push(code)
    return {
      toggleVote: vote.toggleVote,
      hasVoted: vote.hasVoted,
      isVoting: false,
    }
  },
}))

vi.mock("@/hooks/use-my-presets", () => ({
  useMyPresets: () => ({ data: { authenticated: false, items: [] } }),
}))

beforeEach(() => {
  vote.toggleVote.mockReset()
  vote.hasVoted = false
  vote.codes = []
})

describe("PresetMenu", () => {
  it("saves the preset on the page, a shuffled one included", () => {
    const onOverride = vi.fn()
    const { rerender } = render(
      <PresetMenu
        jevCode={undefined}
        override={undefined}
        onOverride={onOverride}
      />
    )
    expect(vote.codes.at(-1)).toBe(DEFAULT_PRESET)

    fireEvent.click(screen.getByRole("button", { name: "Shuffle preset" }))
    const shuffled = onOverride.mock.calls[0][0] as string
    rerender(
      <PresetMenu
        jevCode={undefined}
        override={shuffled}
        onOverride={onOverride}
      />
    )

    fireEvent.click(screen.getByRole("button", { name: "Save preset" }))
    expect(vote.codes.at(-1)).toBe(shuffled)
    expect(vote.toggleVote).toHaveBeenCalledTimes(1)
  })

  it("shows a saved preset as saved, and offers to remove it", () => {
    vote.hasVoted = true
    render(
      <PresetMenu
        jevCode={undefined}
        override={undefined}
        onOverride={vi.fn()}
      />
    )
    const button = screen.getByRole("button", {
      name: "Remove from saved presets",
    })
    expect(button.getAttribute("aria-pressed")).toBe("true")
  })
})
