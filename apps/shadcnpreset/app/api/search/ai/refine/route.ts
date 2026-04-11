import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { NextResponse } from "next/server"
import { z } from "zod"

import { buildAiSearchSystemPrompt } from "@/lib/ai-search-system-prompt"

export const maxDuration = 60

const bodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(8000),
      })
    )
    .min(1)
    .max(24),
})

const outputSchema = z.object({
  optimizedSearchQuery: z
    .string()
    .min(1)
    .max(400)
    .describe(
      "Single line of keywords for preset search, English, no surrounding quotes"
    ),
})

function mapProviderError(err: unknown): {
  status: number
  body: { error: string; code?: string }
} {
  const raw = err instanceof Error ? err.message : String(err)
  const lower = raw.toLowerCase()

  if (
    lower.includes("exceeded your current quota") ||
    lower.includes("insufficient_quota") ||
    (lower.includes("billing") && lower.includes("openai")) ||
    (lower.includes("quota") && lower.includes("check your plan"))
  ) {
    return {
      status: 402,
      body: {
        code: "openai_quota",
        error:
          "Your OpenAI account has no credits or billing is not set up. Add a payment method or credits at platform.openai.com, or use Smart search without the AI assistant.",
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
        error:
          "OpenAI rate limit reached. Wait a minute and try again, or switch to Smart search.",
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
        error:
          "OpenAI rejected the API key. Check OPENAI_API_KEY in your environment.",
      },
    }
  }

  return {
    status: 502,
    body: {
      error:
        raw.length > 280
          ? `${raw.slice(0, 277)}…`
          : raw || "Failed to generate search query",
    },
  }
}

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      {
        error:
          "AI search is not configured. Set OPENAI_API_KEY in the environment.",
      },
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

  const modelId = process.env.OPENAI_SEARCH_MODEL ?? "gpt-4o-mini"

  try {
    const { object } = await generateObject({
      model: openai(modelId),
      system: buildAiSearchSystemPrompt(),
      messages: parsed.data.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      schema: outputSchema,
      temperature: 0.3,
      maxRetries: 0,
    })

    return NextResponse.json({
      optimizedSearchQuery: object.optimizedSearchQuery.trim(),
    })
  } catch (err) {
    console.error("[ai/refine]", err)
    const { status, body } = mapProviderError(err)
    return NextResponse.json(body, { status })
  }
}
