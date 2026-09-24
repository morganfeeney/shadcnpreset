/**
 * Pulls shadcncraft registry items into components/shadcncraft — the
 * checkout of the private repo that holds them (see `pnpm sync:shadcncraft`)
 * — following the import recipe instead of `shadcn add` (which would write
 * into components/ui). Commit and push new blocks there, then pin them.
 *
 *   pnpm import:shadcncraft hero-2 benefits-3 …
 *
 * Follows @shadcncraft registry dependencies, rewrites imports onto cn-ui and
 * our folders, and strips the page gutters the preview frame already has.
 * Files that already exist are left alone: earlier imports carry hand fixes.
 * Anything it cannot fix mechanically is reported at the end — run tsc and
 * `pnpm generate:icon-allowlists` after.
 */
import { execFileSync } from "node:child_process"
import { existsSync, mkdirSync, writeFileSync } from "node:fs"
import path from "node:path"

import {
  SHADCNCRAFT_PREFIX as PREFIX,
  viewShadcncraftItems as view,
  type RegistryItem,
} from "./lib/shadcncraft-registry"

const ROOT = path.resolve(import.meta.dirname, "..")
const OUT = path.join(ROOT, "components/shadcncraft")
const BATCH = 20

/** Upstream path → our folder layout, or null for files we do not keep. */
function destination(file: string): string | null {
  // blocks/pro-<pack>/<category>/<block>/<rest>
  const block = file.match(/^blocks\/pro-[^/]+\/[^/]+\/([^/]+)\/(.+)$/)
  if (block) return path.join(OUT, "blocks", block[1], block[2])
  // components/[shadcncraft/]pro-<pack>/[<family>/]<name>.tsx
  const ui = file.match(
    /^components\/(?:shadcncraft\/)?pro-[^/]+\/(?:[^/]+\/)?([^/]+)$/
  )
  if (ui) return path.join(OUT, "ui", ui[1])
  const hook = file.match(/^(?:hooks|components\/shadcncraft\/hooks)\/(.+)$/)
  if (hook) return path.join(OUT, "hooks", hook[1])
  return null
}

/**
 * pro-<pack>/<name> is always ui; only the item's type says whether
 * pro-<pack>/<family>/<name> is ui or a block. Names
 * we already have are known by the files they left in ui/.
 */
function shadcncraftImport(spec: string, uiNames: Set<string>): string {
  const parts = spec.split("/").slice(1)
  const name = parts.length === 1 ? parts[0] : parts[1]
  if (
    parts.length === 1 ||
    (parts.length === 2 &&
      (uiNames.has(name) || existsSync(path.join(OUT, "ui", `${name}.tsx`))))
  ) {
    return `@/components/shadcncraft/ui/${name}`
  }
  return `@/components/shadcncraft/blocks/${parts.slice(1).join("/")}`
}

const PAGE_GUTTER =
  /\s(?:px-4 (?:sm|md|lg):px-6(?: xl:px-8)?|px-6 lg:px-8|px-4 lg:px-8)(?=[\s"])/g

function rewrite(content: string, uiNames: Set<string>): string {
  return (
    content
      .replace(
        /(["'])@\/components\/(?:shadcncraft\/)?(pro-[^"']+)\1/g,
        (_, q, spec) => `${q}${shadcncraftImport(spec, uiNames)}${q}`
      )
      .replace(
        /(["'])@\/registry\/[^"']*\/ui\/(pro-[^"']+)\1/g,
        (_, q, spec) => `${q}${shadcncraftImport(spec, uiNames)}${q}`
      )
      .replace(/@\/components\/ui\//g, "@/components/cn-ui/")
      .replace(
        /@\/registry\/icons\/icon-placeholder/g,
        "@/components/icon-placeholder"
      )
      .replace(/(["'])@\/hooks\//g, "$1@/components/shadcncraft/hooks/")
      // The preview frame sits inside the preset page's own gutter.
      .replace(/className="([^"]*)"/g, (whole, classes: string) => {
        let next = classes
        if (/\bmax-w-/.test(next) || /\bmx-auto\b/.test(next)) {
          next = next.replace(PAGE_GUTTER, "")
        }
        // Tailwind v4's container does not centre.
        next = next.replace(
          /(^|\s)container(?=\s|$)/,
          "$1mx-auto w-full max-w-7xl"
        )
        // Blocks stack in a page; none gets the whole viewport.
        next = next.replace(/(^|\s)min-h-(?:svh|screen|dvh)(?=\s|$)/g, "")
        return next === classes ? whole : `className="${next.trim()}"`
      })
      // Logo links would navigate the preview frame.
      .replace(/href="\/"/g, 'href="#"')
  )
}

/** Patterns the recipe fixes by hand; reported rather than guessed at. */
const NEEDS_HANDS: [RegExp, string][] = [
  [/from ["']react-icons/, "react-icons import (swap to @remixicon/react)"],
  [/type="(?:single|multiple)"/, "Radix Accordion props"],
  [/checked="indeterminate"/, "Radix indeterminate checkbox"],
  [/SelectAccessibilityFix/, "Radix Select hack"],
  [/position="(?:popper|item-aligned)"/, "Radix SelectContent position"],
  [/onSelect=\{/, "Radix menu onSelect"],
  [/lg:ring-0|lg:rounded-none/, "chrome-undoing utilities (need `!`)"],
  [
    /@\/components\/cn-ui\/badge/,
    "check badge usage (shadcncraft badge is not cn-ui)",
  ],
]

function main() {
  const requested = process.argv.slice(2)
  if (!requested.length) {
    console.error("Name at least one @shadcncraft item.")
    process.exit(1)
  }

  const seen = new Set<string>()
  const queue = [...requested]
  const items: RegistryItem[] = []
  while (queue.length) {
    const batch = queue.splice(0, BATCH).filter((n) => !seen.has(n))
    if (!batch.length) continue
    batch.forEach((n) => seen.add(n))
    for (const item of view(batch)) {
      items.push(item)
      for (const dep of item.registryDependencies ?? []) {
        if (dep.startsWith(PREFIX)) {
          const name = dep.slice(PREFIX.length)
          if (!seen.has(name)) queue.push(name)
        }
      }
    }
  }

  const uiNames = new Set(
    items
      .filter((item) => item.type !== "registry:block")
      .map((item) => item.name)
  )
  const written: string[] = []
  const kept: string[] = []
  const skipped: string[] = []
  const warnings: string[] = []
  const npm = new Set<string>()
  const cnUi = new Set<string>()

  for (const item of items) {
    item.dependencies?.forEach((d) => npm.add(d))
    item.registryDependencies
      ?.filter((d) => !d.includes("/") && !d.startsWith("http"))
      .forEach((d) => cnUi.add(d))

    for (const file of item.files ?? []) {
      const dest = destination(file.path)
      if (!dest) {
        skipped.push(`${item.name}: ${file.path}`)
        continue
      }
      const rel = path.relative(ROOT, dest)
      if (existsSync(dest)) {
        kept.push(rel)
        continue
      }
      const content = rewrite(file.content, uiNames)
      for (const [pattern, note] of NEEDS_HANDS) {
        if (pattern.test(content)) warnings.push(`${rel}: ${note}`)
      }
      mkdirSync(path.dirname(dest), { recursive: true })
      writeFileSync(dest, content)
      written.push(rel)
    }
  }

  if (written.length) {
    execFileSync("pnpm", ["exec", "prettier", "--write", ...written], {
      cwd: ROOT,
      stdio: "ignore",
    })
  }

  const missingUi = [...cnUi].filter(
    (name) => !existsSync(path.join(ROOT, "components/cn-ui", `${name}.tsx`))
  )

  console.log(`Wrote ${written.length} files, kept ${kept.length} existing.`)
  if (skipped.length) console.log(`\nNot placed:\n  ${skipped.join("\n  ")}`)
  if (missingUi.length) console.log(`\nMissing cn-ui: ${missingUi.join(", ")}`)
  if (npm.size) console.log(`\nnpm dependencies: ${[...npm].join(", ")}`)
  if (warnings.length) console.log(`\nNeeds hands:\n  ${warnings.join("\n  ")}`)
}

main()
