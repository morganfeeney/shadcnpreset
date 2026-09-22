/**
 * Runs real descriptions through Jev and checks what came back.
 *
 * The unit tests in `lib/jev-presets` cover the code that turns answers into a
 * preset. They say nothing about whether the option descriptions in
 * `fields.ts` still mean to Jev what we think they mean — and those are the
 * thing that keeps being wrong. Only asking it tells you that, and asking costs
 * money and time, so this is a script rather than a test: run it after editing
 * a question, and compare.
 *
 * Two kinds of case, because only one of them has a right answer:
 *
 * - CHECKS: the description names something outright ("no corners"), so the
 *   field it names must come back a given way. These fail the run.
 * - WATCH: the description is a mood ("cosy coffee shop"). There is no correct
 *   font for a coffee shop, so these only print what they got. Read the diff
 *   between runs; a change is not automatically a regression.
 *
 * Every check here has been wrong at least once.
 *
 * Usage:
 *   pnpm eval:describe                 # every case, once each
 *   pnpm eval:describe --runs 3        # three samples per case (Jev varies)
 *   pnpm eval:describe --only corners  # cases matching a substring
 *   pnpm eval:describe --json          # machine-readable, for diffing runs
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import type { PresetConfig } from "shadcn/preset"

import { askJevAboutDescription } from "@/lib/jev-presets/ask-jev"
import { readPresetFromJev } from "@/lib/jev-presets/read-preset"

// Same as the other scripts that call an API: Next loads .env.local for the
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

/** A field must come back as this value, or as one of these values. */
type Expected = Partial<Record<keyof PresetConfig, string | string[]>>

/** Descriptions that name something, and the field that naming must produce. */
const CHECKS: Array<{ description: string; expect: Expected; note: string }> = [
  {
    description: "padded no corners orange",
    expect: { radius: "none" },
    note: '"no corners" read as pill-shaped until the option named border-radius 0',
  },
  {
    description: "no corners",
    expect: { radius: "none" },
    note: "the same shorthand with nothing else to go on",
  },
  {
    description: "sharp square corners",
    expect: { radius: "none" },
    note: "the unambiguous phrasing",
  },
  {
    description: "very rounded pill buttons",
    expect: { radius: "large" },
    note: "the opposite end, so a corners fix cannot just always answer none",
  },
  {
    description: "funky rhea pink charts green theme",
    expect: { style: "rhea", theme: "green", chartColor: "pink" },
    note: "one vivid word used to take both the accent and the charts",
  },
  {
    description: "funky rhea yellow charts pink theme",
    expect: { theme: "pink", chartColor: "yellow" },
    note: "the same crossover the other way round",
  },
  {
    description: "green charts, blue theme",
    expect: { theme: "blue", chartColor: "green" },
    note: "plainly worded version of the same thing",
  },
  {
    description: "taupe everything",
    expect: { baseColor: "taupe", theme: "taupe" },
    note: "a neutral tone as the accent has to match the neutrals",
  },
  {
    description: "monochrome brutalist",
    expect: { theme: "neutral", radius: "none" },
    note: "a grey accent fell through to an unrelated colour",
  },
  {
    description: "minimal docs site with serif headings",
    expect: {
      fontHeading: [
        "lora",
        "merriweather",
        "noto-serif",
        "eb-garamond",
        "playfair-display",
        "instrument-serif",
        "roboto-slab",
      ],
    },
    note: "a named family, so any serif passes — just not a sans",
  },
  {
    description: "dark dashboard",
    expect: { menuColor: "inverted" },
    note: "the shell is the one facet people name most",
  },
  {
    description: "light airy marketing site",
    expect: { menuColor: "default" },
    note: "the opposite shell",
  },
  {
    description: "compact dense data table",
    expect: { style: "mira" },
    note: "spacing only reaches the preset through the style",
  },
  {
    description: "airy minimal",
    expect: { style: "lyra" },
    note: "sparse, not padded — the other end of the same axis",
  },
  {
    description: "big chunky marketing page",
    expect: { style: "luma" },
    note: "roomy and loud, where Lyra is roomy and quiet",
  },
  {
    description: "sera tight",
    expect: { style: "sera" },
    note: "a style named outright lost to the mood word next to it",
  },
  {
    description: "mira but roomy",
    expect: { style: "mira" },
    note: "the same clash the other way round",
  },
  {
    description: "phosphor icons with jetbrains mono blue charts green theme",
    expect: {
      iconLibrary: "phosphor",
      font: "jetbrains-mono",
      chartColor: "blue",
      theme: "green",
    },
    note: "words in front used to swap the two colours round",
  },
  {
    description: "charts are green theme is blue",
    expect: { chartColor: "green", theme: "blue" },
    note: "the other word order, where 'green theme' also reads as a phrase",
  },
  {
    description: "lucide icons",
    expect: { iconLibrary: "lucide" },
    note: "naming a library outright",
  },
  {
    description: "phosphor icons with jetbrains mono",
    expect: { iconLibrary: "phosphor", font: "jetbrains-mono" },
    note: "two exact names in one line",
  },
]

/** Moods, with no right answer. Printed for reading, never failed. */
const WATCH = [
  // The term matcher ignores "outfit" here (terms.test.ts covers that), but
  // Jev may still pick the typeface on its own, which is a fair reading.
  "outfit store for teens",
  // "padded" has no field of its own: Maia and Luma are both fair readings.
  "padded",
  "monochrome padded corners",
  "cosy coffee shop",
  "dark fintech dashboard",
  "playful pink app for kids",
  "old fashioned newspaper",
  "cyberpunk gaming",
  "modern newsletter",
  "luxury fashion editorial",
  "brutalist, sharp, black and white",
  "calm editorial blog",
  "high energy sports app",
  // Nonsense: these must still produce a preset rather than an error.
  "a",
  "asdfgh",
]

type Outcome = {
  description: string
  kind: "check" | "watch"
  ok: boolean
  /** Field → what came back, for every field a check named. */
  got: Record<string, string>
  expected: Expected | null
  summary: string
  ms: number
  error: string | null
}

function parseArgs(argv: string[]) {
  const runs = Number(argv[argv.indexOf("--runs") + 1]) || 1
  const onlyIndex = argv.indexOf("--only")
  return {
    runs,
    only: onlyIndex === -1 ? null : (argv[onlyIndex + 1] ?? null),
    json: argv.includes("--json"),
  }
}

function summarize(config: PresetConfig): string {
  return [
    config.style,
    `${config.baseColor}/${config.theme}`,
    `charts ${config.chartColor}`,
    `${config.fontHeading}/${config.font}`,
    config.iconLibrary,
    `radius ${config.radius}`,
    `${config.menuColor}/${config.menuAccent}`,
  ].join(", ")
}

async function evaluate(
  description: string,
  kind: "check" | "watch",
  expected: Expected | null
): Promise<Outcome> {
  const started = performance.now()
  const base = {
    description,
    kind,
    expected,
    got: {} as Record<string, string>,
  }

  try {
    const jev = await askJevAboutDescription(description)
    const reading = readPresetFromJev(jev.answers, description)
    const ms = Math.round(performance.now() - started)

    if (!reading) {
      return {
        ...base,
        ok: false,
        summary: "no preset built",
        ms,
        error: "readPresetFromJev returned null",
      }
    }

    const got: Record<string, string> = {}
    for (const field of Object.keys(expected ?? {}) as Array<
      keyof PresetConfig
    >) {
      got[field] = String(reading.config[field])
    }

    const ok = Object.entries(expected ?? {}).every(([field, value]) =>
      Array.isArray(value) ? value.includes(got[field]!) : got[field] === value
    )

    return {
      ...base,
      got,
      ok,
      summary: `${reading.code}  ${summarize(reading.config)}`,
      ms,
      error: null,
    }
  } catch (error) {
    return {
      ...base,
      ok: false,
      summary: "request failed",
      ms: Math.round(performance.now() - started),
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

function describeMismatch(outcome: Outcome): string {
  if (outcome.error) return outcome.error
  return Object.entries(outcome.expected ?? {})
    .filter(([field, value]) =>
      Array.isArray(value)
        ? !value.includes(outcome.got[field]!)
        : outcome.got[field] !== value
    )
    .map(([field, value]) => {
      const wanted = Array.isArray(value) ? `one of ${value.join(", ")}` : value
      return `${field}: wanted ${wanted}, got ${outcome.got[field]}`
    })
    .join("; ")
}

async function main() {
  const { runs, only, json } = parseArgs(process.argv.slice(2))

  if (!process.env.JEV_API_KEY?.trim()) {
    console.error("JEV_API_KEY is not set (looked in the environment and .env.local).")
    process.exitCode = 1
    return
  }

  const matches = (text: string) => !only || text.includes(only)
  const checks = CHECKS.filter(
    (check) =>
      matches(check.description) ||
      Object.keys(check.expect).some((field) => matches(field))
  )
  const watch = WATCH.filter(matches)

  if (!checks.length && !watch.length) {
    console.error(`No case matches "${only}".`)
    process.exitCode = 1
    return
  }

  const outcomes: Outcome[] = []

  for (const check of checks) {
    for (let run = 0; run < runs; run += 1) {
      const outcome = await evaluate(check.description, "check", check.expect)
      outcomes.push(outcome)
      if (!json) {
        console.log(
          `${outcome.ok ? "PASS" : "FAIL"}  ${check.description}\n      ${
            outcome.ok ? outcome.summary : describeMismatch(outcome)
          }`
        )
        if (!outcome.ok) console.log(`      (${check.note})`)
      }
    }
  }

  for (const description of watch) {
    for (let run = 0; run < runs; run += 1) {
      const outcome = await evaluate(description, "watch", null)
      outcomes.push(outcome)
      if (!json) {
        console.log(`----  ${description}\n      ${outcome.summary}`)
      }
    }
  }

  if (json) {
    console.log(JSON.stringify(outcomes, null, 2))
    return
  }

  const checked = outcomes.filter((outcome) => outcome.kind === "check")
  const passed = checked.filter((outcome) => outcome.ok).length
  const failedWatch = outcomes.filter(
    (outcome) => outcome.kind === "watch" && outcome.error
  )
  const slowest = Math.max(...outcomes.map((outcome) => outcome.ms))
  const median = [...outcomes.map((o) => o.ms)].sort((a, b) => a - b)[
    Math.floor(outcomes.length / 2)
  ]

  console.log(
    `\n${passed}/${checked.length} checks passed. ${outcomes.length} requests, ${median} ms median, ${slowest} ms slowest.`
  )
  for (const outcome of failedWatch) {
    console.log(`  errored: ${outcome.description} — ${outcome.error}`)
  }
  if (passed < checked.length) process.exitCode = 1
}

void main()
