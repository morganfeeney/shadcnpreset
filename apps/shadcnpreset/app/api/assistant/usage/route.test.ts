import { beforeEach, describe, expect, it, vi } from "vitest"

const getSessionUser = vi.fn()
vi.mock("@/lib/auth", () => ({ getSessionUser }))
vi.mock("next/server", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/server")>()),
  connection: async () => {},
}))
const getGenerations = vi.fn(async () => 2)
let limit: number | null = 3
vi.mock("@/lib/assistant-usage", () => ({
  freeGenerationLimit: () => limit,
  getGenerations,
}))

const { GET } = await import("@/app/api/assistant/usage/route")

beforeEach(() => {
  vi.clearAllMocks()
  limit = 3
})

describe("GET /api/assistant/usage", () => {
  it("counts someone's generations against the limit", async () => {
    getSessionUser.mockResolvedValue({ id: "u1" })
    expect(await (await GET()).json()).toEqual({ used: 2, limit: 3 })
  })

  it("has none used for someone signed out", async () => {
    getSessionUser.mockResolvedValue(null)
    expect(await (await GET()).json()).toEqual({ used: 0, limit: 3 })
  })

  it("reads nothing while there is no limit", async () => {
    limit = null
    expect(await (await GET()).json()).toEqual({ used: 0, limit: null })
    expect(getGenerations).not.toHaveBeenCalled()
  })
})
