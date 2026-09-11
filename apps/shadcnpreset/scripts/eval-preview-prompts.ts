/**
 * Runs real prompts through the real model and reports what came back.
 *
 * The corpus in `lib/generated-preview/preview-corpus.ts` protects the rules
 * from each other; it says nothing about whether the model is getting better.
 * Only asking it does, and asking it costs money and time, so this is a script
 * rather than a test: run it deliberately, after changing the prompt or adding
 * a check, and compare the counts.
 *
 * Every prompt here has produced a broken preview at least once.
 *
 * Usage:
 *   pnpm eval:previews                 # every prompt, once each
 *   pnpm eval:previews --runs 3        # three samples per prompt
 *   pnpm eval:previews --only sidebar  # prompts matching a substring
 *   pnpm eval:previews --json          # machine-readable, for diffing runs
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { openai } from "@ai-sdk/openai"
import { generateText, Output } from "ai"
import { DEFAULT_PRESET_CONFIG, encodePreset } from "shadcn/preset"

import { GENERATED_PREVIEW_COMPONENT_NAMES } from "@/lib/generated-preview/catalog"
import { validateGeneratedPreviewSource } from "@/lib/generated-preview/validate"
import { inferPreviewLayout } from "@/lib/generated-preview/infer-layout"
import {
  assistantTurnOutputSchema,
  normalizeAssistantTurn,
} from "@/lib/search/assistant/schema"
import { buildAssistantSystemPrompt } from "@/lib/search/assistant/system-prompt"

// Same as the other scripts that call the API: Next loads .env.local for the
// app, a bare tsx process does not.
const envPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  ".env.local"
)
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    if (!line || line.startsWith("#")) continue
    const separator = line.indexOf("=")
    if (separator === -1) continue
    const key = line.slice(0, separator)
    if (!process.env[key]) process.env[key] = line.slice(separator + 1)
  }
}

const PROMPTS = [
  "show a drawer with a filter panel inside it",
  "show a sheet with a notification settings panel",
  "show a dashboard sidebar with grouped navigation and a user menu at the bottom",
  "show a payment form with card fields grouped in an input group",
  "show a profile settings form with an avatar, a bio textarea and a save button",
  "show a list of team members with avatars, roles and a remove button",
  "show a table of recent invoices with status badges and a row action menu",
  "show a loading state with skeletons for a card grid",
  "show an empty state for a project list with an icon and a call to action",
  "show a settings page with tabs and a danger zone",
  "show a command palette with grouped results",
  "show a dropdown menu with icons and a destructive item",
  "show a sign-up form with name, email and password",
  "show a set of buttons in every variant and size",
  "show a date picker",
]

type Outcome = {
  prompt: string
  ok: boolean
  /** The check it tripped, or "not-a-preview" when the turn was some other phase. */
  issue: string | null
  layout: string | null
  detail: string | null
}

function parseArgs(argv: string[]) {
  const runs = Number(argv[argv.indexOf("--runs") + 1]) || 1
  const onlyIndex = argv.indexOf("--only")
  return {
    runs,
    only: onlyIndex === -1 ? null : argv[onlyIndex + 1] ?? null,
    json: argv.includes("--json"),
  }
}

async function evaluatePrompt(prompt: string): Promise<Outcome> {
  const result = await generateText({
    model: openai(process.env.OPENAI_ASSISTANT_MODEL ?? "gpt-4o-mini"),
    system: [
      buildAssistantSystemPrompt(),
      `The preset currently applied is ${encodePreset(DEFAULT_PRESET_CONFIG)}.`,
    ].join("\n\n"),
    messages: [{ role: "user", content: prompt }],
    output: Output.object({
      schema: assistantTurnOutputSchema,
      name: "PresetAssistantTurn",
      description: "Preview: JSX Preview() in previewCode.",
    }),
    temperature: 0.35,
    maxRetries: 0,
  })

  const turn = result.output ? normalizeAssistantTurn(result.output) : null
  if (turn?.phase !== "preview") {
    return {
      prompt,
      ok: false,
      issue: "not-a-preview",
      layout: null,
      detail: `phase was ${turn?.phase ?? "unparseable"}`,
    }
  }

  const validated = validateGeneratedPreviewSource(
    turn.preview.code,
    GENERATED_PREVIEW_COMPONENT_NAMES
  )
  const layout = inferPreviewLayout(turn.preview.code)

  if (validated.ok) {
    return { prompt, ok: true, issue: null, layout, detail: null }
  }

  // The first failing check, which is what the repair pass would be told.
  const issue =
    Object.keys(validated).find(
      (key) => key !== "ok" && key !== "error" && validated[key as never]
    ) ?? "unknown"

  return { prompt, ok: false, issue, layout, detail: validated.error }
}

async function main() {
  const { runs, only, json } = parseArgs(process.argv.slice(2))
  const prompts = only
    ? PROMPTS.filter((prompt) => prompt.includes(only))
    : PROMPTS

  if (!prompts.length) {
    console.error(`No prompt matches "${only}".`)
    process.exitCode = 1
    return
  }

  const outcomes: Outcome[] = []
  for (const prompt of prompts) {
    for (let run = 0; run < runs; run += 1) {
      const outcome = await evaluatePrompt(prompt).catch(
        (error: unknown): Outcome => ({
          prompt,
          ok: false,
          issue: "errored",
          layout: null,
          detail: error instanceof Error ? error.message : String(error),
        })
      )
      outcomes.push(outcome)
      if (!json) {
        const mark = outcome.ok ? "PASS" : "FAIL"
        const tail = outcome.ok
          ? `layout=${outcome.layout}`
          : `${outcome.issue} — ${outcome.detail}`
        console.log(`${mark}  ${prompt}\n      ${tail}`)
      }
    }
  }

  if (json) {
    console.log(JSON.stringify(outcomes, null, 2))
    return
  }

  const passed = outcomes.filter((outcome) => outcome.ok).length
  const byIssue = new Map<string, number>()
  for (const outcome of outcomes) {
    if (outcome.ok || !outcome.issue) continue
    byIssue.set(outcome.issue, (byIssue.get(outcome.issue) ?? 0) + 1)
  }

  console.log(
    `\n${passed}/${outcomes.length} rendered without a repair pass.`
  )
  for (const [issue, count] of [...byIssue].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${count}x ${issue}`)
  }
}

void main()
