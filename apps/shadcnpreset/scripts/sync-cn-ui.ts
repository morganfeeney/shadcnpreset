/**
 * Regenerates `components/cn-ui/*` from the shadcn/ui fork's preset-aware
 * component source (`apps/v4/registry/bases/base/ui`).
 *
 * These components are NOT the ones `shadcn add` installs. The published
 * registry bakes a single style into utility classes at publish time, so those
 * copies cannot respond to preset switching. The fork's source keeps the
 * `cn-*` semantic classes that `vendor/v4/registry/styles/style-*.css` targets,
 * which is what makes one component tree render every preset.
 *
 * Usage:
 *   pnpm sync:cn-ui           # write
 *   pnpm sync:cn-ui --check   # report drift, write nothing (exit 1 if drifted)
 */
import { existsSync } from "node:fs"
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"

const APP_ROOT = path.resolve(import.meta.dirname, "..")
const FORK =
  process.env.SHADCNPRESET_FORK_PATH ??
  path.resolve(APP_ROOT, "../../../shadcn-ui-fork")
const SRC = path.join(FORK, "apps/v4/registry/bases/base/ui")
const DEST = path.join(APP_ROOT, "components/cn-ui")

const HEADER = `/**
 * Synced from the shadcn/ui fork by \`pnpm sync:cn-ui\` — do not edit by hand.
 * Source: apps/v4/registry/bases/base/ui/{file}
 */
`

/**
 * Components whose fork source needs a package this app does not install.
 * Add the dependency and remove the entry to pull the component in.
 */
const SKIP_MISSING_DEPS: Record<string, string> = {
  "message-scroller.tsx": "@shadcn/react",
  "questionnaire.tsx": "@shadcn/react",
}

/**
 * Deliberate local divergences. Listing a file here keeps the local copy and
 * documents why, so the sync does not silently revert a considered decision.
 */
const KEEP_LOCAL: Record<string, string> = {
  "drawer.tsx":
    "local build uses vaul; the fork has migrated to @base-ui/react/drawer",
}

/** Rewrites fork-internal module paths onto this app's aliases. */
const REWRITES: Array<[RegExp, string]> = [
  [/from "cn"/g, 'from "@/lib/utils"'],
  [/@\/registry\/bases\/base\/ui\//g, "@/components/cn-ui/"],
  [/@\/registry\/bases\/base\/hooks\//g, "@/hooks/"],
  [
    /@\/app\/\(create\)\/components\/icon-placeholder/g,
    "@/components/icon-placeholder",
  ],
]

function rewrite(source: string, file: string): string {
  let out = source
  for (const [pattern, replacement] of REWRITES) {
    out = out.replace(pattern, replacement)
  }
  return HEADER.replace("{file}", file) + out
}

async function main() {
  const check = process.argv.includes("--check")

  if (!existsSync(SRC)) {
    console.error(`sync-cn-ui: fork components not found at ${SRC}`)
    console.error(
      "Set SHADCNPRESET_FORK_PATH to your shadcn/ui fork clone (default: ../shadcn-ui-fork)."
    )
    process.exit(1)
  }

  await mkdir(DEST, { recursive: true })

  const files = (await readdir(SRC))
    .filter((f) => f.endsWith(".tsx"))
    .sort()

  const written: string[] = []
  const unchanged: string[] = []
  const drifted: string[] = []
  const skipped: string[] = []

  for (const file of files) {
    if (SKIP_MISSING_DEPS[file]) {
      skipped.push(`${file} (needs ${SKIP_MISSING_DEPS[file]})`)
      continue
    }
    if (KEEP_LOCAL[file]) {
      skipped.push(`${file} (kept local: ${KEEP_LOCAL[file]})`)
      continue
    }

    const next = rewrite(await readFile(path.join(SRC, file), "utf8"), file)
    const destPath = path.join(DEST, file)
    const current = existsSync(destPath)
      ? await readFile(destPath, "utf8")
      : null

    if (current === next) {
      unchanged.push(file)
      continue
    }

    drifted.push(file)
    if (!check) {
      await writeFile(destPath, next)
      written.push(file)
    }
  }

  const forkNames = new Set(files)
  const localOnly = (await readdir(DEST))
    .filter((f) => f.endsWith(".tsx") && !forkNames.has(f))
    .sort()

  console.log(`source:  ${SRC}`)
  console.log(`dest:    ${DEST}`)
  console.log(
    `\n${unchanged.length} unchanged, ${drifted.length} ${
      check ? "drifted" : "written"
    }, ${skipped.length} skipped`
  )
  if (skipped.length) {
    console.log("\nskipped:")
    for (const s of skipped) console.log(`  - ${s}`)
  }
  if (localOnly.length) {
    console.log("\nlocal-only (no fork equivalent, left untouched):")
    for (const f of localOnly) console.log(`  - ${f}`)
  }
  if (drifted.length) {
    console.log(`\n${check ? "drifted" : "written"}:`)
    for (const f of drifted) console.log(`  - ${f}`)
  }

  if (check && drifted.length) {
    console.error("\nsync-cn-ui: components differ from the fork. Run `pnpm sync:cn-ui`.")
    process.exit(1)
  }
}

await main()
