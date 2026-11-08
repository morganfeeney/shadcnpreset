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

describe("POST /api/assistant with a preset open to customize", () => {
  const OPEN = {
    presetCode: "b0",
    colours: { theme: "#DE00CE", overrides: {} },
  }

  /** The database as the turn sees it: no answers used yet. */
  function noAnswersUsed() {
    query.mockImplementation(async (sql: string) => {
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
    notChanged: [],
  }

  function wroteCustomPresets() {
    return query.mock.calls.some(([sql]) =>
      String(sql).includes("custom_presets")
    )
  }

  it("edits the preset it is sent instead of finding presets", async () => {
    noAnswersUsed()
    generateText.mockResolvedValue({ output: EDIT })

    const response = await post({
      customPreset: OPEN,
      messages: [{ role: "user", content: "make it green" }],
    })
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toMatchObject({
      phase: "custom",
      // Said from what changed, named as the Theme picker shows it.
      assistantMessage: "Changed the Theme to Green.",
      changed: ["Theme: Green"],
      customPreset: { colours: { overrides: {} } },
    })
    expect(body.customPreset.presetCode).not.toBe("b0")
    expect(body.customPreset.colours.theme).toBeUndefined()
    expect(String(generateText.mock.calls[0][0].system)).toContain(
      "editing one custom shadcn preset"
    )
    expect(countedGenerations()).toHaveLength(1)
  })

  it("reads a pasted theme as written: no model, no generation", async () => {
    noAnswersUsed()

    const body = await (
      await post({
        customPreset: OPEN,
        messages: [
          {
            role: "user",
            content:
              ":root { --primary: #0F766E; --shadow-md: 0 1px 2px black; }",
          },
        ],
      })
    ).json()

    expect(generateText).not.toHaveBeenCalled()
    expect(body.customPreset.colours.overrides).toEqual({ primary: "#0F766E" })
    expect(body.assistantMessage).toContain(
      "A preset has no setting for `--shadow-md`."
    )
    expect(
      query.mock.calls.some(([sql]) => String(sql).includes("assistant_usage"))
    ).toBe(false)
  })

  it("leaves saving to the page: nothing is written", async () => {
    noAnswersUsed()
    generateText.mockResolvedValue({ output: EDIT })

    await post({ customPreset: OPEN })

    expect(wroteCustomPresets()).toBe(false)
  })

  it("keeps a colour the model named but left out of its answer", async () => {
    noAnswersUsed()
    generateText.mockResolvedValue({
      output: {
        ...EDIT,
        theme: null,
        assistantMessage: "Changed the Chart Color to #00BDDF.",
      },
    })

    const response = await post({
      customPreset: OPEN,
      messages: [
        { role: "user", content: "now use this on the charts #00BDDF" },
      ],
    })
    const body = await response.json()

    expect(body.customPreset.colours.chartColor).toBe("#00BDDF")
    expect(body.assistantMessage).toBe("Changed the Chart Color to #00BDDF.")
  })

  it("gives the preset back as it was when nothing changed", async () => {
    noAnswersUsed()
    generateText.mockResolvedValue({
      output: { ...EDIT, theme: null, assistantMessage: "Which part?" },
    })

    const body = await (await post({ customPreset: OPEN })).json()

    expect(body.changed).toEqual([])
    expect(body.customPreset).toEqual(OPEN)
  })

  it("refuses a code that isn't a preset, without asking the model", async () => {
    noAnswersUsed()

    const response = await post({
      customPreset: { ...OPEN, presetCode: "nope" },
    })

    expect(response.status).toBe(400)
    expect(generateText).not.toHaveBeenCalled()
  })
})

describe("POST /api/assistant asking for a custom preset", () => {
  function made() {
    return query.mock.calls.find(([sql]) =>
      String(sql).includes("INSERT INTO custom_presets")
    )
  }

  it("answers with presets to make one from, rather than making it", async () => {
    await post({
      messages: [
        { role: "user", content: "Make a custom preset with #DE00CE" },
      ],
    })

    expect(made()).toBeUndefined()
    expect(String(generateText.mock.calls[0][0].system)).toContain(
      "Go straight to ready"
    )
  })

  it("lets other requests ask a question first", async () => {
    await post({
      messages: [{ role: "user", content: "Presets like #DE00CE" }],
    })

    expect(String(generateText.mock.calls[0][0].system)).not.toContain(
      "They asked for a custom preset"
    )
  })
})
