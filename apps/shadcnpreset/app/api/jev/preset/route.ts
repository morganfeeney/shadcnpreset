import { NextResponse } from "next/server"
import { z } from "zod"

import {
  askJevAboutDescription,
  JevRequestError,
} from "@/lib/jev-presets/ask-jev"
import { readPresetFromJev } from "@/lib/jev-presets/read-preset"

const bodySchema = z.object({
  description: z.string().trim().min(1).max(300),
})

/** One description in, the one preset Jev reads from it out. */
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
      { error: "Describe a look in 300 characters or fewer." },
      { status: 400 }
    )
  }

  const started = performance.now()
  try {
    const jev = await askJevAboutDescription(
      parsed.data.description,
      request.signal
    )
    const reading = readPresetFromJev(jev.answers, parsed.data.description)
    if (!reading) {
      console.error("[api/jev/preset] unreadable answers", jev.answers)
      return NextResponse.json(
        { error: "Could not build a preset from that description." },
        { status: 502 }
      )
    }

    return NextResponse.json({
      ...reading,
      model: jev.model,
      ms: Math.round(performance.now() - started),
    })
  } catch (error) {
    if (request.signal.aborted) {
      // The visitor typed on; nobody is waiting for this answer.
      return new NextResponse(null, { status: 499 })
    }
    console.error("[api/jev/preset]", error)
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
