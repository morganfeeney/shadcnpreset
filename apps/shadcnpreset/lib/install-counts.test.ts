import { describe, expect, it, vi } from "vitest"

const { query } = vi.hoisted(() => ({ query: vi.fn() }))
vi.mock("@/lib/db", () => ({ query }))

const { countInstallQuietly } = await import("@/lib/install-counts")

const cli = () =>
  new Request("http://localhost/r/colours/b0/x.json", {
    headers: { "User-Agent": "shadcn" },
  })

describe("countInstallQuietly", () => {
  it("counts the shadcn CLI fetching the link", async () => {
    query.mockClear()
    await countInstallQuietly(cli(), "b0")
    expect(query).toHaveBeenCalledWith(expect.any(String), ["b0"])
  })

  it("doesn't count a browser, a link preview or a crawler", async () => {
    query.mockClear()
    for (const agent of [
      "Mozilla/5.0 (Macintosh) Chrome/131",
      "Slackbot-LinkExpanding 1.0",
      "Googlebot/2.1",
    ]) {
      await countInstallQuietly(
        new Request("http://localhost/x", {
          headers: { "User-Agent": agent },
        }),
        "b0"
      )
    }
    expect(query).not.toHaveBeenCalled()
  })

  it("never fails an install over a count it can't keep", async () => {
    query.mockRejectedValueOnce(
      new Error('relation "install_counts" does not exist')
    )
    vi.spyOn(console, "error").mockImplementation(() => {})

    await expect(countInstallQuietly(cli(), "b0")).resolves.toBeUndefined()
  })
})
