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
    })

    return NextResponse.json({
      optimizedSearchQuery: object.optimizedSearchQuery.trim(),
    })
  } catch (err) {
    console.error("[ai/refine]", err)
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to generate search query",
      },
      { status: 502 }
    )
  }
}
