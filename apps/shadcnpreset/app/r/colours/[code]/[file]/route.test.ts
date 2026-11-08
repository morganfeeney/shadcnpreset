import { beforeEach, describe, expect, it, vi } from "vitest"

import { customColoursRegistryPath } from "@/lib/custom-preset"

const { countInstallQuietly } = vi.hoisted(() => ({
  countInstallQuietly: vi.fn(async (code: string) => {
    void code
  }),
}))
vi.mock("@/lib/install-counts", () => ({ countInstallQuietly }))

import { GET } from "./route"

const CODE = "b0"
const ORANGE = { theme: "#CC5500", overrides: { destructive: "#DC2626" } }

function get(path: string) {
  const [, , , code, file] = path.split("/")
  return GET(new Request(`http://localhost${path}`), {
    params: Promise.resolve({ code: code!, file: file! }),
  })
}

beforeEach(() => countInstallQuietly.mockClear())

describe("GET /r/colours/<preset>/<colours>.json", () => {
  it("is the colours in the link, as a theme shadcn installs", async () => {
    const path = customColoursRegistryPath(CODE, ORANGE)
    expect(path).toMatch(/^\/r\/colours\/b0\/[\w-]+\.json$/)

    const response = await get(path)
    const item = await response.json()

    expect(response.status).toBe(200)
    expect(item.type).toBe("registry:theme")
    expect(item.cssVars.light.destructive).toBe("#DC2626")
    expect(item.cssVars.dark.destructive).toBe("#DC2626")
    expect(item.cssVars.light.radius).toBeUndefined()
    expect(countInstallQuietly).toHaveBeenCalledWith(CODE)
  })

  it("is not found for colours that don't read, counting nothing", async () => {
    expect((await get("/r/colours/b0/not-colours.json")).status).toBe(404)
    expect(countInstallQuietly).not.toHaveBeenCalled()
  })

  it("is not found for a preset that isn't one", async () => {
    const path = customColoursRegistryPath("nope", ORANGE)
    expect((await get(path)).status).toBe(404)
  })
})
