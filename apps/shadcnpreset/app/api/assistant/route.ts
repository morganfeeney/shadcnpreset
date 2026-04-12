import { openai } from "@ai-sdk/openai"
import { generateText, Output } from "ai"
import { encodePreset, type PresetConfig } from "shadcn/preset"
import { NextResponse } from "next/server"
import { z } from "zod"

import { clampPresetConfigForV4Preview } from "@/lib/preset-catalog"
import { buildAssistantSystemPrompt } from "@/lib/search/assistant/system-prompt"
import {
  assistantTurnOutputSchema,
  normalizeAssistantTurn,
  type AssistantPresetVariantPayload,
  type AssistantReady,
} from "@/lib/search/assistant/schema"

export const maxDuration = 60

const bodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(12000),
      })
    )
    .min(1)
    .max(32),
})

function variantToConfig(v: AssistantPresetVariantPayload): PresetConfig {
  const { caption: _c, ...rest } = v
  return clampPresetConfigForV4Preview(rest as PresetConfig)
}

function buildPresetCardDescription(c: PresetConfig): string {
  const chart = c.chartColor ?? c.theme
  const typo =
    c.fontHeading === "inherit" || c.fontHeading === c.font
      ? `${c.font} font`
      : `${c.fontHeading} & ${c.font} fonts`
  return `${c.baseColor} base, ${c.theme} theme, ${chart} charts, ${c.iconLibrary}, ${typo}`
}

function mapProviderError(err: unknown): {
  status: number
  body: Record<string, unknown>
} {
  const raw = err instanceof Error ? err.message : String(err)
  const lower = raw.toLowerCase()

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
  >
): AssistantReady {
  const seen = new Set<string>()
  const presets: AssistantReady["presets"] = []

  for (const v of normalized.presetVariants) {
    const config = variantToConfig(v)
    const code = encodePreset(config)
    if (seen.has(code)) continue
    seen.add(code)
    presets.push({
      code,
      caption: v.caption.trim() || code,
      description: buildPresetCardDescription(config),
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
      system: buildAssistantSystemPrompt(),
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
      const ready = encodeReadyPayload(normalized)
      if (ready.presets.length < 1) {
        return NextResponse.json(
          {
            error:
              "Could not produce distinct presets from that answer. Please try again.",
          },
          { status: 422 }
        )
      }
      return NextResponse.json(ready)
    }

    return NextResponse.json(normalized)
  } catch (err) {
    console.error("[api/assistant]", err)
    const { status, body } = mapProviderError(err)
    return NextResponse.json(body, { status })
  }
}
