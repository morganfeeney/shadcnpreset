import { beforeEach, describe, expect, it, vi } from "vitest"

const getSessionUser = vi.fn()
vi.mock("@/lib/auth", () => ({
  getSessionUser: () => getSessionUser(),
}))

const getAssistantChatForUser = vi.fn()
const saveAssistantChatForUser = vi.fn()
vi.mock("@/lib/assistant-chat-store", () => ({
  getAssistantChatForUser: (...args: unknown[]) =>
    getAssistantChatForUser(...args),
  saveAssistantChatForUser: (...args: unknown[]) =>
    saveAssistantChatForUser(...args),
}))

// The usage count is the only thing here that reaches the database.
const query = vi.fn()
vi.mock("@/lib/db", () => ({
  query: (...args: unknown[]) => query(...args),
}))

/** Answers the user has already had. */
function usedGenerations(generations: number) {
  query.mockImplementation(async (sql: string) =>
    sql.includes("SELECT generations")
      ? { rows: [{ generations }] }
      : { rows: [] }
  )
}

function countedGenerations() {
  return query.mock.calls.filter(([sql]) =>
    String(sql).includes("INSERT INTO assistant_usage")
  )
}

const generateText = vi.fn()
vi.mock("ai", async (importOriginal) => ({
  ...(await importOriginal<typeof import("ai")>()),
  generateText: (...args: unknown[]) => generateText(...args),
}))

const { POST } = await import("@/app/api/assistant/route")
const { resolvePresetFromCode } = await import("@/lib/preset")

const USER = { id: "user-1", name: "Morgan" }
/** An id for a chat that used to exist. */
const CLIENT_CHAT_ID = "11111111-2222-4333-8444-555555555555"

function post(body: Record<string, unknown>) {
  return POST(
    new Request("http://localhost/api/assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: "Orange presets" }],
        ...body,
      }),
    })
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  process.env.OPENAI_API_KEY = "test-key"
  getSessionUser.mockResolvedValue(USER)
  delete process.env.ASSISTANT_FREE_GENERATIONS
  usedGenerations(0)
  getAssistantChatForUser.mockResolvedValue(null)
  saveAssistantChatForUser.mockImplementation(
    async ({ chatId }: { chatId?: string }) => ({
      chatId: chatId ?? "server-minted",
      title: "t",
      createdAt: 0,
      updatedAt: 0,
    })
  )
  generateText.mockResolvedValue({
    output: {
      phase: "gathering",
      assistantMessage: "What are you building?",
      followUpQuestions: ["A dashboard"],
      presetVariants: [],
      previewTitle: "",
      previewCode: "",
    },
  })
})

describe("POST /api/assistant", () => {
  it("names a new chat when its first answer is ready", async () => {
    // No id goes up with the first send: there is no chat until there is
    // something in it.
    const response = await post({})

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      chatId: "server-minted",
    })
    expect(saveAssistantChatForUser).toHaveBeenCalledWith(
      expect.objectContaining({ chatId: undefined, user: USER })
    )
  })

  it("says so when an id points at a chat that is gone", async () => {
    const response = await post({ chatId: CLIENT_CHAT_ID })

    expect(response.status).toBe(404)
    await expect(response.json()).resolves.toMatchObject({
      code: "chat_missing",
    })
    expect(saveAssistantChatForUser).not.toHaveBeenCalled()
  })

  it("continues a chat that exists", async () => {
    getAssistantChatForUser.mockResolvedValue({
      id: CLIENT_CHAT_ID,
      messages: [{ role: "user", kind: "text", content: "Earlier turn" }],
    })

    const response = await post({ chatId: CLIENT_CHAT_ID })

    expect(response.status).toBe(200)
    const [[call]] = generateText.mock.calls as [[{ messages: unknown[] }]]
    expect(call.messages).toEqual([
      { role: "user", content: "Earlier turn" },
      { role: "user", content: "Orange presets" },
    ])
  })

  it("refuses a caller with no session", async () => {
    getSessionUser.mockResolvedValue(null)

    const response = await post({})

    expect(response.status).toBe(401)
    expect(generateText).not.toHaveBeenCalled()
  })
})

describe("POST /api/assistant free generations", () => {
  it("counts each answer someone gets", async () => {
    const response = await post({})

    expect(response.status).toBe(200)
    expect(countedGenerations()).toEqual([[expect.any(String), [USER.id]]])
  })

  it("has no limit until one is set", async () => {
    usedGenerations(500)

    const response = await post({})

    expect(response.status).toBe(200)
    expect(generateText).toHaveBeenCalled()
  })

  it("asks for Pro past the free answers, without asking the model", async () => {
    process.env.ASSISTANT_FREE_GENERATIONS = "3"
    usedGenerations(3)

    const response = await post({})

    expect(response.status).toBe(402)
    expect(await response.json()).toMatchObject({ code: "pro_required" })
    expect(generateText).not.toHaveBeenCalled()
    expect(countedGenerations()).toEqual([])
  })

  it("answers while free generations remain", async () => {
    process.env.ASSISTANT_FREE_GENERATIONS = "3"
    usedGenerations(2)

    const response = await post({})

    expect(response.status).toBe(200)
  })
})

describe("POST /api/assistant with a custom preset open", () => {
  const OWNED = {
    id: "cp-1",
    user_id: USER.id,
    preset_code: "b0",
    colours: JSON.stringify({ theme: "#DE00CE", overrides: {} }),
  }

  /** The database as the turn sees it: the custom preset, no answers used. */
  function storedPreset(row: Record<string, unknown> | null) {
    query.mockImplementation(async (sql: string) => {
      if (sql.includes("FROM custom_presets")) return { rows: row ? [row] : [] }
      if (sql.includes("SELECT generations"))
        return { rows: [{ generations: 0 }] }
      return { rows: [], rowCount: 1 }
    })
  }

  const EDIT = {
    assistantMessage: "Made the theme green.",
    style: null,
    font: null,
    fontHeading: null,
    iconLibrary: null,
    radius: null,
    baseColor: null,
    theme: "green",
    chartColor: null,
    overrides: [],
    removeOverrides: [],
  }

  function edited() {
    return query.mock.calls.find(([sql]) =>
      String(sql).includes("UPDATE custom_presets")
    )
  }

  it("edits the open custom preset instead of finding presets", async () => {
    storedPreset(OWNED)
    generateText.mockResolvedValue({ output: EDIT })

    const response = await post({
      customPresetId: "cp-1",
      messages: [{ role: "user", content: "make it green" }],
    })
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toMatchObject({
      phase: "custom",
      // Said from what changed, named as the Theme picker shows it.
      assistantMessage: "Changed the Theme to Green.",
      changed: ["Theme: Green"],
      customPreset: { id: "cp-1", colours: { overrides: {} } },
    })
    expect(body.customPreset.colours.theme).toBeUndefined()
    expect(edited()?.[1].slice(0, 2)).toEqual(["cp-1", USER.id])
    expect(String(generateText.mock.calls[0][0].system)).toContain(
      "editing one custom shadcn preset"
    )
    expect(countedGenerations()).toHaveLength(1)
  })

  it("saves a colour the model named but left out of its answer", async () => {
    storedPreset(OWNED)
    generateText.mockResolvedValue({
      output: {
        ...EDIT,
        theme: null,
        assistantMessage: "Changed the Chart Color to #00BDDF.",
      },
    })

    const response = await post({
      customPresetId: "cp-1",
      messages: [
        { role: "user", content: "now use this on the charts #00BDDF" },
      ],
    })
    const body = await response.json()

    expect(body.customPreset.colours.chartColor).toBe("#00BDDF")
    expect(body.assistantMessage).toBe("Changed the Chart Color to #00BDDF.")
    expect(JSON.parse(edited()?.[1][3]).chartColor).toBe("#00BDDF")
  })

  it("saves nothing when nothing changed", async () => {
    storedPreset(OWNED)
    generateText.mockResolvedValue({
      output: { ...EDIT, theme: null, assistantMessage: "Which part?" },
    })

    const response = await post({ customPresetId: "cp-1" })

    expect((await response.json()).changed).toEqual([])
    expect(edited()).toBeUndefined()
  })

  it("won't edit someone else's custom preset, or ask the model", async () => {
    storedPreset({ ...OWNED, user_id: "someone-else" })

    const response = await post({ customPresetId: "cp-1" })

    expect(response.status).toBe(404)
    expect(generateText).not.toHaveBeenCalled()
  })
})

describe("POST /api/assistant asking for a custom preset", () => {
  const ASK = "Make a custom preset with Lora, Raleway and #DE00CE"

  const FONTS = {
    assistantMessage: "",
    style: null,
    font: "raleway",
    fontHeading: "lora",
    iconLibrary: null,
    radius: null,
    baseColor: null,
    theme: "#000000",
    chartColor: null,
    overrides: [],
    removeOverrides: [],
  }

  function made() {
    return query.mock.calls.find(([sql]) =>
      String(sql).includes("INSERT INTO custom_presets")
    )
  }

  it("makes it with the fonts asked for and the colours exactly", async () => {
    generateText.mockResolvedValue({ output: FONTS })

    const response = await post({
      messages: [{ role: "user", content: ASK }],
    })
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toMatchObject({
      phase: "custom",
      created: true,
      chatId: "server-minted",
      customPreset: { colours: { theme: "#DE00CE", overrides: {} } },
    })
    expect(body.assistantMessage).toContain("Raleway with Lora for headings")
    const preset = resolvePresetFromCode(body.customPreset.presetCode)
    expect(preset?.font).toBe("raleway")
    expect(preset?.fontHeading).toBe("lora")
    // Saved with the chat that asked, under the id the answer gives.
    const [, params] = made()!
    expect(params.slice(0, 2)).toEqual([body.customPreset.id, USER.id])
    expect(params[4]).toBe("server-minted")
    expect(countedGenerations()).toHaveLength(1)
  })

  it("builds on the preset last offered in the chat", async () => {
    generateText.mockResolvedValue({
      output: { ...FONTS, font: null, fontHeading: null },
    })
    getAssistantChatForUser.mockResolvedValue({
      id: CLIENT_CHAT_ID,
      messages: [
        { role: "user", content: "Mira presets" },
        {
          role: "assistant",
          kind: "presets",
          content: "Here you go.",
          presets: [{ code: "b1xTHeDQJE", caption: "c", description: "d" }],
        },
      ],
    })

    const response = await post({
      chatId: CLIENT_CHAT_ID,
      messages: [{ role: "user", content: ASK }],
    })

    expect((await response.json()).customPreset.presetCode).toBe("b1xTHeDQJE")
  })

  it("refuses past the account's cap, before asking the model", async () => {
    process.env.CUSTOM_PRESET_LIMIT = "3"
    query.mockImplementation(async (sql: string) => {
      if (sql.includes("COUNT(*)")) return { rows: [{ count: 3 }] }
      if (sql.includes("SELECT generations"))
        return { rows: [{ generations: 0 }] }
      return { rows: [], rowCount: 1 }
    })

    const response = await post({
      messages: [{ role: "user", content: ASK }],
    })

    expect(response.status).toBe(402)
    expect((await response.json()).code).toBe("custom_preset_limit")
    expect(generateText).not.toHaveBeenCalled()
    expect(made()).toBeUndefined()
    expect(countedGenerations()).toHaveLength(0)
    delete process.env.CUSTOM_PRESET_LIMIT
  })

  it("leaves colours given without asking for one to the presets", async () => {
    await post({
      messages: [{ role: "user", content: "Presets like #DE00CE" }],
    })

    expect(made()).toBeUndefined()
    expect(String(generateText.mock.calls[0][0].system)).not.toContain(
      "editing one custom shadcn preset"
    )
  })
})
