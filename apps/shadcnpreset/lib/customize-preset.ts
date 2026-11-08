import { readBrandColours } from "@/lib/brand-theme"

/** "Make a custom preset with…": asked for by name, not just any colours. */
export function asksForCustomPreset(text: string) {
  return /\bcustom\s+presets?\b/i.test(text)
}

/**
 * The message a preset is customized from. Exact colours are what no preset
 * can hold, so the latest message giving any wins, and keeps winning for the
 * rest of the chat: "bolder" still means bolder in those colours. Without
 * them it is the latest message, for the fonts, style, icons or radius it
 * asks for.
 */
export function customizeRequestText(
  messages: readonly { role: string; content: string }[]
) {
  const asks = messages.filter((m) => m.role === "user")
  const withColours = asks.findLast((m) => readBrandColours(m.content).length)
  return (withColours ?? asks.at(-1))?.content ?? ""
}
