import { buildJevQuestions } from "@/lib/jev-presets/fields"
import type { JevChoiceAnswer } from "@/lib/jev-presets/read-preset"

const SYSTEM_ONE_URL = "https://api.typesafe.ai/v1/systemone"
/** Jev usually answers in ~250 ms; anything this slow is not coming back. */
const TIMEOUT_MS = 8_000

/** Built once: the questions never change between requests. */
const QUESTIONS = buildJevQuestions()

export class JevRequestError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message)
  }
}

export type JevResponse = {
  model: string
  answers: Record<string, JevChoiceAnswer | undefined>
}

/**
 * Asks Jev every preset question about one description, in a single request.
 * Server only — the key must never reach the browser.
 */
export async function askJevAboutDescription(
  description: string,
  signal?: AbortSignal
): Promise<JevResponse> {
  const apiKey = process.env.JEV_API_KEY?.trim()
  if (!apiKey) throw new JevRequestError("JEV_API_KEY is not configured.", 503)

  const response = await fetch(SYSTEM_ONE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "jev-latest",
      state: { description },
      questions: QUESTIONS,
    }),
    // Drop the upstream call too when the visitor has already typed past it.
    signal: signal
      ? AbortSignal.any([signal, AbortSignal.timeout(TIMEOUT_MS)])
      : AbortSignal.timeout(TIMEOUT_MS),
    cache: "no-store",
  })

  if (!response.ok) {
    const detail = await response.text().catch(() => "")
    throw new JevRequestError(
      `Jev returned ${response.status}${detail ? `: ${detail.slice(0, 200)}` : ""}`,
      response.status === 429 ? 429 : 502
    )
  }

  return (await response.json()) as JevResponse
}
