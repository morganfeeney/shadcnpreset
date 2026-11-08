import { describe, expect, it, vi } from "vitest"

const { query } = vi.hoisted(() => ({ query: vi.fn() }))
vi.mock("@/lib/db", () => ({ query }))

const { countInstallQuietly } = await import("@/lib/install-counts")

describe("countInstallQuietly", () => {
  it("never fails an install over a count it can't keep", async () => {
    query.mockRejectedValueOnce(
      new Error('relation "install_counts" does not exist')
    )
    vi.spyOn(console, "error").mockImplementation(() => {})

    await expect(countInstallQuietly("b0")).resolves.toBeUndefined()
  })
})
