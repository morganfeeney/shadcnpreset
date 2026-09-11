import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  getGeneratedPreviewServerSnapshot,
  getGeneratedPreviewSnapshot,
  resetGeneratedPreviewStoreForTests,
  setStoredGeneratedPreview,
  subscribeToGeneratedPreview,
} from "@/lib/generated-preview/store"

describe("generated preview store", () => {
  beforeEach(() => {
    resetGeneratedPreviewStoreForTests()
  })

  it("renders nothing on the server so hydration matches", () => {
    expect(getGeneratedPreviewServerSnapshot()).toBeNull()
  })

  it("keeps a stable snapshot reference between reads", () => {
    setStoredGeneratedPreview({ title: "Date picker", code: "<DatePicker />" })

    expect(getGeneratedPreviewSnapshot()).toBe(getGeneratedPreviewSnapshot())
  })

  it("notifies subscribers when the preview changes", () => {
    const listener = vi.fn()
    const unsubscribe = subscribeToGeneratedPreview(listener)

    setStoredGeneratedPreview({ title: "Date picker", code: "<DatePicker />" })
    expect(listener).toHaveBeenCalledTimes(1)

    // Same payload — no re-render should be triggered.
    setStoredGeneratedPreview({ title: "Date picker", code: "<DatePicker />" })
    expect(listener).toHaveBeenCalledTimes(1)

    setStoredGeneratedPreview({ title: "Login form", code: "<LoginForm />" })
    expect(listener).toHaveBeenCalledTimes(2)

    unsubscribe()
    setStoredGeneratedPreview(null)
    expect(listener).toHaveBeenCalledTimes(2)
  })

  it("clears the stored preview", () => {
    setStoredGeneratedPreview({ title: "Date picker", code: "<DatePicker />" })
    setStoredGeneratedPreview(null)

    expect(getGeneratedPreviewSnapshot()).toBeNull()
  })
})
