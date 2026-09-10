import { describe, expect, it } from "vitest"

import {
  assistantChatIdFromPath,
  assistantChatPath,
  isAssistantChatId,
} from "@/lib/assistant-chat-path"

const CHAT_ID = "3f1a2b4c-5d6e-4f70-8a9b-0c1d2e3f4a5b"

describe("isAssistantChatId", () => {
  it("accepts a chat id minted by the store", () => {
    expect(isAssistantChatId(CHAT_ID)).toBe(true)
  })

  it("rejects anything that is not a uuid", () => {
    expect(isAssistantChatId("abc-123")).toBe(false)
    expect(isAssistantChatId("")).toBe(false)
    expect(isAssistantChatId(null)).toBe(false)
    expect(isAssistantChatId(undefined)).toBe(false)
  })
})

describe("assistantChatPath", () => {
  it("addresses a chat by its id", () => {
    expect(assistantChatPath(CHAT_ID)).toBe(`/assistant/${CHAT_ID}`)
  })

  it("falls back to the new-chat page", () => {
    expect(assistantChatPath(null)).toBe("/assistant")
    expect(assistantChatPath(undefined)).toBe("/assistant")
    expect(assistantChatPath("not-a-chat")).toBe("/assistant")
  })
})

describe("assistantChatIdFromPath", () => {
  it("reads the chat back out of its path", () => {
    expect(assistantChatIdFromPath(assistantChatPath(CHAT_ID))).toBe(CHAT_ID)
  })

  it("has no chat for the new-chat page or another route", () => {
    expect(assistantChatIdFromPath("/assistant")).toBeNull()
    expect(assistantChatIdFromPath("/assistant/not-a-chat")).toBeNull()
    expect(assistantChatIdFromPath(`/preset/${CHAT_ID}`)).toBeNull()
  })
})
