import { beforeEach, describe, expect, it, vi } from "vitest"

const getSessionUser = vi.fn()
vi.mock("@/lib/auth", () => ({
  getSessionUser: () => getSessionUser(),
}))

const query = vi.fn()
vi.mock("@/lib/db", () => ({
  query: (...args: unknown[]) => query(...args),
}))

const { POST } = await import("@/app/api/custom-presets/route")
const { GET: READ, PATCH } = await import("@/app/api/custom-presets/[id]/route")
const { GET } = await import("@/app/r/custom/[file]/route")

const CODE = "b5dyaqxe6"

function request(method: string, body: unknown) {
  return new Request("http://localhost/api/custom-presets", {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  getSessionUser.mockResolvedValue({ id: "user-1", name: "Morgan" })
  query.mockResolvedValue({ rows: [], rowCount: 1 })
  delete process.env.CUSTOM_PRESET_LIMIT
})

const COLOURS = { theme: "#CC5500", overrides: { background: "#101418" } }

describe("POST /api/custom-presets", () => {
  it("saves the preset with its colours as given", async () => {
    const response = await POST(
      request("POST", { presetCode: CODE, colours: COLOURS })
    )

    expect(response.status).toBe(200)
    expect((await response.json()).id).toEqual(expect.any(String))
    const [sql, params] = query.mock.calls[0]
    expect(sql).toContain("INSERT INTO custom_presets")
    expect(params.slice(1, 3)).toEqual(["user-1", CODE])
    expect(JSON.parse(params[3])).toEqual(COLOURS)
  })

  it("refuses past the account's cap", async () => {
    process.env.CUSTOM_PRESET_LIMIT = "3"
    query.mockImplementation(async (sql: string) =>
      sql.includes("COUNT(*)")
        ? { rows: [{ count: 3 }] }
        : { rows: [], rowCount: 1 }
    )

    const response = await POST(
      request("POST", { presetCode: CODE, colours: COLOURS })
    )

    expect(response.status).toBe(402)
    expect(await response.json()).toMatchObject({
      code: "custom_preset_limit",
      limit: 3,
    })
    expect(
      query.mock.calls.some(([sql]) => String(sql).includes("INSERT"))
    ).toBe(false)
  })

  it("saves one under the cap", async () => {
    process.env.CUSTOM_PRESET_LIMIT = "3"
    query.mockImplementation(async (sql: string) =>
      sql.includes("COUNT(*)")
        ? { rows: [{ count: 2 }] }
        : { rows: [], rowCount: 1 }
    )

    const response = await POST(
      request("POST", { presetCode: CODE, colours: COLOURS })
    )

    expect(response.status).toBe(200)
  })

  it("refuses a colour a stylesheet can't use", async () => {
    const response = await POST(
      request("POST", {
        presetCode: CODE,
        colours: { theme: "burnt orange", overrides: {} },
      })
    )

    expect(response.status).toBe(400)
    expect(query).not.toHaveBeenCalled()
  })

  it("refuses a request without colours", async () => {
    const response = await POST(request("POST", { presetCode: CODE }))

    expect(response.status).toBe(400)
    expect(query).not.toHaveBeenCalled()
  })

  it("asks someone signed out to sign in", async () => {
    getSessionUser.mockResolvedValue(null)
    const response = await POST(
      request("POST", { presetCode: CODE, colours: COLOURS })
    )
    expect(response.status).toBe(401)
    expect(query).not.toHaveBeenCalled()
  })

  it("refuses a code that is not a preset", async () => {
    const response = await POST(
      request("POST", { presetCode: "nope", colours: COLOURS })
    )
    expect(response.status).toBe(400)
    expect(query).not.toHaveBeenCalled()
  })
})

describe("PATCH /api/custom-presets/[id]", () => {
  const params = { params: Promise.resolve({ id: "cp-1" }) }
  const colours = {
    theme: "#DE00CE",
    baseColor: "oklch(0.5 0.05 260)",
    overrides: { background: "#141414" },
  }

  it("saves the preset and colours for its owner", async () => {
    const response = await PATCH(
      request("PATCH", { presetCode: CODE, colours }),
      params
    )

    expect(response.status).toBe(200)
    const [sql, values] = query.mock.calls[0]
    expect(sql).toContain("UPDATE custom_presets")
    expect(values.slice(0, 3)).toEqual(["cp-1", "user-1", CODE])
    expect(JSON.parse(values[3])).toEqual(colours)
  })

  it("treats someone else's preset as missing", async () => {
    query.mockResolvedValue({ rows: [], rowCount: 0 })
    const response = await PATCH(
      request("PATCH", { presetCode: CODE, colours }),
      params
    )
    expect(response.status).toBe(404)
  })

  it("refuses a colour a stylesheet can't use", async () => {
    for (const colour of ["pantone 200 C", "not a colour"]) {
      const response = await PATCH(
        request("PATCH", {
          presetCode: CODE,
          colours: { theme: colour, overrides: {} },
        }),
        params
      )
      expect(response.status).toBe(400)
    }
    expect(query).not.toHaveBeenCalled()
  })

  it("refuses a token the theme doesn't have", async () => {
    const response = await PATCH(
      request("PATCH", {
        presetCode: CODE,
        colours: { overrides: { sparkle: "#DE00CE" } },
      }),
      params
    )
    expect(response.status).toBe(400)
  })
})

describe("GET /api/custom-presets/[id]", () => {
  const params = { params: Promise.resolve({ id: "cp-1" }) }
  const row = {
    id: "cp-1",
    user_id: "user-1",
    preset_code: CODE,
    colours: JSON.stringify({ theme: "#DE00CE", overrides: {} }),
  }

  it("gives the preset and lets its owner edit", async () => {
    query.mockResolvedValue({ rows: [row] })

    const response = await READ(new Request("http://localhost"), params)

    expect(await response.json()).toEqual({
      id: "cp-1",
      presetCode: CODE,
      colours: { theme: "#DE00CE", overrides: {} },
      canEdit: true,
    })
  })

  it("lets anyone else read it, but not edit", async () => {
    query.mockResolvedValue({ rows: [row] })
    getSessionUser.mockResolvedValue({ id: "someone-else", name: "Sam" })

    const response = await READ(new Request("http://localhost"), params)

    expect((await response.json()).canEdit).toBe(false)
  })

  it("is not found for an unknown id", async () => {
    query.mockResolvedValue({ rows: [] })
    const response = await READ(new Request("http://localhost"), params)
    expect(response.status).toBe(404)
  })
})

describe("GET /r/custom/[file]", () => {
  it("serves the colours as a registry item", async () => {
    query.mockResolvedValue({
      rows: [
        {
          id: "cp-1",
          user_id: "user-1",
          preset_code: CODE,
          colours: JSON.stringify({ theme: "#DE00CE", overrides: {} }),
        },
      ],
    })

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ file: "cp-1.json" }),
    })

    expect(response.status).toBe(200)
    expect(query.mock.calls[0][1]).toEqual(["cp-1"])
    const item = await response.json()
    expect(item.type).toBe("registry:theme")
    expect(item.cssVars.light.primary).toBe("#DE00CE")
  })

  it("is not found for an unknown id", async () => {
    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ file: "missing.json" }),
    })
    expect(response.status).toBe(404)
  })
})
