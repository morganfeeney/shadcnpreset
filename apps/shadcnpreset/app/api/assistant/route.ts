import { openai } from "@ai-sdk/openai"
import { generateText, Output } from "ai"
import { encodePreset, type PresetConfig } from "shadcn/preset"
import { NextResponse } from "next/server"
import { z } from "zod"

import { saveAssistantChatForUser } from "@/lib/assistant-chat-store"
import { getSessionUser } from "@/lib/auth"
import { clampPresetConfigForV4Preview } from "@/lib/preset-catalog"
import { resolvePresetFromCode } from "@/lib/preset"
import {
  applyPaletteConstraints,
  applyTypographyConstraints,
  buildPresetCardDescription,
  extractPaletteConstraints,
  extractTypographyConstraints,
} from "@/lib/search/assistant/constraint-engine"
import { buildAssistantSystemPrompt } from "@/lib/search/assistant/system-prompt"
import {
  assistantTurnOutputSchema,
  normalizeAssistantTurn,
  type AssistantPresetVariantPayload,
  type AssistantReady,
} from "@/lib/search/assistant/schema"

export const maxDuration = 60

const bodySchema = z.object({
  chatId: z.string().uuid().optional(),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(12000),
      })
    )
    .min(1)
    .max(32),
  previousPresetCodes: z.array(z.string().min(2).max(32)).max(4).optional(),
})

function variantToConfig(v: AssistantPresetVariantPayload): PresetConfig {
  const { caption: _c, ...rest } = v
  return clampPresetConfigForV4Preview(rest as PresetConfig)
}

function buildPreviousPresetContext(previousPresets: PresetConfig[]): string {
  if (!previousPresets.length) return ""
  const lines = previousPresets.map((p, i) => {
    const code = encodePreset(p)
    return `Variant ${i + 1} (${code}): style=${p.style}, baseColor=${p.baseColor}, theme=${p.theme}, chartColor=${p.chartColor ?? p.theme}, fontHeading=${p.fontHeading}, font=${p.font}, iconLibrary=${p.iconLibrary}, radius=${p.radius}, menuColor=${p.menuColor}, menuAccent=${p.menuAccent}`
  })
  return [
    "Current preset set (latest stage):",
    ...lines,
    "When the user asks for edits, treat this as the baseline set.",
    "Semantics: \"one of them\" => exactly one variant should satisfy the new facet; \"at least one\" => one or more; \"all/each/every\" => all variants.",
    "Preserve unchanged facets unless explicitly asked to modify them.",
  ].join("\n")
}

function presetToVariantPayload(
  config: PresetConfig,
  caption: string
): AssistantPresetVariantPayload {
  return {
    ...config,
    chartColor: config.chartColor ?? config.theme,
    caption,
  }
}

function mapProviderError(err: unknown): {
  status: number
  body: Record<string, unknown>
} {
  const raw = err instanceof Error ? err.message : String(err)
  const lower = raw.toLowerCase()

  if (lower.includes("unauthorized chat access")) {
    return {
      status: 403,
      body: { code: "assistant_chat_forbidden", error: "Chat access denied." },
    }
  }

  if (
    lower.includes("exceeded your current quota") ||
    lower.includes("insufficient_quota") ||
    (lower.includes("billing") && lower.includes("openai"))
  ) {
    return {
      status: 402,
      body: {
        code: "openai_quota",
        error:
          "OpenAI quota or billing issue. Check your account at platform.openai.com.",
      },
    }
  }

  if (
    lower.includes("rate limit") ||
    lower.includes("too many requests") ||
    raw.includes("429")
  ) {
    return {
      status: 429,
      body: {
        code: "openai_rate_limit",
        error: "OpenAI rate limit — try again shortly.",
      },
    }
  }

  if (
    lower.includes("invalid api key") ||
    lower.includes("incorrect api key") ||
    lower.includes("invalid_api_key")
  ) {
    return {
      status: 401,
      body: {
        code: "openai_auth",
        error: "OpenAI rejected the API key (OPENAI_API_KEY).",
      },
    }
  }

  return {
    status: 502,
    body: {
      error:
        raw.length > 500 ? `${raw.slice(0, 497)}…` : raw || "Assistant failed",
      code: "assistant_error",
    },
  }
}

/** Drops duplicate encodings — identical facet tuples → one card (see assistant prompt: vary fonts/icons/radius when colours match). */
function encodeReadyPayload(
  normalized: Extract<
    ReturnType<typeof normalizeAssistantTurn>,
    { phase: "ready" }
  >,
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  previousPresets: PresetConfig[]
): AssistantReady {
  const seen = new Set<string>()
  const presets: AssistantReady["presets"] = []
  const typographyConstraints = extractTypographyConstraints(messages)
  const paletteConstraints = extractPaletteConstraints(messages)

  const variants: AssistantPresetVariantPayload[] = [...normalized.presetVariants]
  while (variants.length < 4 && previousPresets[variants.length]) {
    variants.push(
      presetToVariantPayload(
        previousPresets[variants.length]!,
        `Variant ${variants.length + 1}`
      )
    )
  }

  for (const v of variants) {
    const config = applyPaletteConstraints(
      applyTypographyConstraints(variantToConfig(v), typographyConstraints),
      paletteConstraints
    )
    const clamped = clampPresetConfigForV4Preview(config)
    const code = encodePreset(clamped)
    if (seen.has(code)) continue
    seen.add(code)
    presets.push({
      code,
      caption: v.caption.trim() || code,
      description: buildPresetCardDescription(clamped),
    })
    if (presets.length >= 4) break
  }

  return {
    phase: "ready",
    assistantMessage: normalized.assistantMessage,
    presets,
  }
}

export async function POST(request: Request) {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json(
      {
        error: "Sign in required to use the assistant.",
        code: "auth_required",
      },
      { status: 401 }
    )
  }

  if (!process.env.OPENAI_API_KEY?.trim()) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured." },
      { status: 503 }
    )
  }

  let json: unknown
  try {
    json = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const modelId = process.env.OPENAI_ASSISTANT_MODEL ?? "gpt-4o-mini"
  const previousPresets = (parsed.data.previousPresetCodes ?? [])
    .map((code) => resolvePresetFromCode(code))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
  const previousPresetContext = buildPreviousPresetContext(previousPresets)

  const chatMessages = parsed.data.messages.filter((m, i) => {
    if (i === 0 && m.role === "assistant") return false
    return true
  })
  if (!chatMessages.length || chatMessages[0]!.role !== "user") {
    return NextResponse.json(
      { error: "Send a user message first." },
      { status: 400 }
    )
  }

  try {
    const result = await generateText({
      model: openai(modelId),
      system: [buildAssistantSystemPrompt(), previousPresetContext]
        .filter((s) => s.trim().length > 0)
        .join("\n\n"),
      messages: chatMessages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      output: Output.object({
        schema: assistantTurnOutputSchema,
        name: "PresetAssistantTurn",
        description:
          'Gathering: follow-up tap labels, empty presetVariants. Ready: 1–4 full facet tuples + captions, empty followUpQuestions strings.',
      }),
      temperature: 0.35,
      maxRetries: 0,
    })

    const object = result.output
    if (!object) {
      return NextResponse.json(
        {
          error:
            "The model did not return structured output. Try again or shorten your message.",
          code: "no_output",
        },
        { status: 502 }
      )
    }

    const normalized = normalizeAssistantTurn(object)
    if (!normalized) {
      console.error("[api/assistant] normalize failed", object)
      return NextResponse.json(
        {
          error:
            "Assistant returned an incomplete answer. Please try again or shorten your message.",
        },
        { status: 422 }
      )
    }

    if (normalized.phase === "ready") {
      const ready = encodeReadyPayload(normalized, chatMessages, previousPresets)
      if (ready.presets.length < 1) {
        return NextResponse.json(
          {
            error:
              "Could not produce distinct presets from that answer. Please try again.",
          },
          { status: 422 }
        )
      }
      const persistedMessages = [
        ...chatMessages.map((message) => ({
          role: message.role,
          kind: "text" as const,
          content: message.content,
        })),
        {
          role: "assistant" as const,
          kind: "presets" as const,
          content: ready.assistantMessage,
          presets: ready.presets,
        },
      ]
      const persisted = await saveAssistantChatForUser({
        user,
        chatId: parsed.data.chatId,
        messages: persistedMessages,
      })
      return NextResponse.json({ ...ready, chatId: persisted.chatId })
    }

    const persistedMessages = [
      ...chatMessages.map((message) => ({
        role: message.role,
        kind: "text" as const,
        content: message.content,
      })),
      {
        role: "assistant" as const,
        kind: "text" as const,
        content: normalized.assistantMessage,
      },
    ]
    const persisted = await saveAssistantChatForUser({
      user,
      chatId: parsed.data.chatId,
      messages: persistedMessages,
    })

    return NextResponse.json({ ...normalized, chatId: persisted.chatId })
  } catch (err) {
    console.error("[api/assistant]", err)
    const { status, body } = mapProviderError(err)
    return NextResponse.json(body, { status })
  }
}
