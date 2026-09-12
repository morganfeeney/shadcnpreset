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
