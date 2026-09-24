import { NextResponse } from "next/server"
import { z } from "zod"

import {
  askJev,
  JevRequestError,
  PRESET_QUESTIONS,
} from "@/lib/jev-presets/ask-jev"
import {
  readPresetFromJev,
  type JevChoiceAnswer,
} from "@/lib/jev-presets/read-preset"
import {
  buildPageQuestions,
  readPageFromJev,
  type PageBuilderAnswers,
} from "@/lib/page-builder/read-page"

const bodySchema = z.object({
  description: z.string().trim().min(1).max(300),
})

/** Built once: the questions never change between requests. */
const QUESTIONS = { ...PRESET_QUESTIONS, ...buildPageQuestions() }

/**
 * One description in; the page it describes and the preset it suggests out,
 * both from a single Jev request.
 */
export async function POST(request: Request) {
  let json: unknown
  try {
    json = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Describe a page in 300 characters or fewer." },
      { status: 400 }
    )
  }

  const { description } = parsed.data
  const started = performance.now()
  try {
    const jev = await askJev<PageBuilderAnswers>(
      { description },
      QUESTIONS,
      request.signal
    )
    const page = readPageFromJev(jev.answers)
    const preset = readPresetFromJev(
      jev.answers as Record<string, JevChoiceAnswer | undefined>,
      description
    )
    if (!page || !preset) {
      console.error("[api/jev/page] unreadable answers", jev.answers)
      return NextResponse.json(
        { error: "Could not build a page from that description." },
        { status: 502 }
      )
    }

    return NextResponse.json({
      page,
      preset,
      model: jev.model,
      ms: Math.round(performance.now() - started),
    })
  } catch (error) {
    if (request.signal.aborted) {
      // The visitor typed on; nobody is waiting for this answer.
      return new NextResponse(null, { status: 499 })
    }
    console.error("[api/jev/page]", error)
    const status = error instanceof JevRequestError ? error.status : 502
    return NextResponse.json(
      {
        error:
          status === 429
            ? "Too many requests — give it a second."
            : "Jev did not answer. Try again.",
      },
      { status }
    )
  }
}
