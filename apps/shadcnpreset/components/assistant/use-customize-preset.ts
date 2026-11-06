"use client"

import * as React from "react"
import { toast } from "sonner"

import { trackEvent } from "@/lib/analytics-events"

/**
 * Customizing a preset from the chat: makes a custom preset from it, saved
 * with the chat, and opens it. Each preset makes its own; customizing one
 * again this visit reopens it rather than making another.
 */
export function useCustomizePreset({
  chatId,
  text,
  onOpen,
  onLimit,
}: {
  chatId: string | null
  /** The message it is made from; the server reads its colours itself. */
  text: string
  onOpen: (id: string) => void
  /** Making one went past the cap an account keeps. */
  onLimit: (limit: number) => void
}) {
  const made = React.useRef(new Map<string, string>())
  const [making, setMaking] = React.useState<string | null>(null)

  async function make(presetCode: string) {
    const key = `${chatId}:${presetCode}`
    const known = made.current.get(key)
    if (known) {
      onOpen(known)
      return
    }
    setMaking(presetCode)
    trackEvent("custom_preset_customize_click", { preset_code: presetCode })
    const response = await fetch("/api/custom-presets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ presetCode, text, chatId }),
    }).catch(() => null)
    const body = response
      ? ((await response.json().catch(() => null)) as {
          id?: string
          code?: string
          limit?: number
        } | null)
      : null
    setMaking(null)
    if (body?.code === "custom_preset_limit") {
      onLimit(body.limit ?? 0)
      return
    }
    if (!response?.ok || !body?.id) {
      toast.error("That didn’t go through. Try again in a moment.")
      return
    }
    made.current.set(key, body.id)
    onOpen(body.id)
  }

  // One function for the life of the chat, so the preset cards it is handed
  // to stay memoised; it reads the latest chat and message when called.
  const latest = React.useRef(make)
  React.useEffect(() => {
    latest.current = make
  })
  const customize = React.useCallback(
    (presetCode: string) => void latest.current(presetCode),
    []
  )

  return { customize, making }
}
