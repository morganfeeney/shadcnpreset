import { readBrandColours } from "@/lib/brand-theme"
import { DEFAULT_CUSTOM_PRESET_BASE } from "@/lib/custom-preset"

type OfferMessage = {
  role: "user" | "assistant"
  content: string
  kind?: string
  presets?: { code: string }[]
}

/**
 * What a chat should be offered a custom preset from, if anything: someone
 * wanting more than a preset can give.
 *
 * Exact colours are what no preset can hold. The latest message giving any
 * keeps the offer for the rest of the chat: "bolder" still means bolder in
 * those colours. Without them, a second set of presets means someone is
 * adjusting a look, which a custom preset does exactly.
 *
 * Either way it starts from the preset the assistant picked last, or the
 * default before it has picked one.
 */
export function customPresetOffer(messages: readonly OfferMessage[]) {
  const answers = messages.filter((m) => m.kind === "presets")
  const presetCode =
    answers.at(-1)?.presets?.[0]?.code ?? DEFAULT_CUSTOM_PRESET_BASE
  const asks = messages.filter((m) => m.role === "user")

  for (const ask of [...asks].reverse()) {
    const colours = readBrandColours(ask.content)
    if (colours.length) return { text: ask.content, colours, presetCode }
  }
  if (answers.length < 2) return null
  return { text: asks.at(-1)?.content ?? "", colours: [], presetCode }
}
