import { execFileSync } from "node:child_process"
import { closeSync, mkdtempSync, openSync, readFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"

export type RegistryItem = {
  name: string
  type: string
  title?: string
  description?: string
  files?: { path: string; content: string }[]
  dependencies?: string[]
  registryDependencies?: string[]
}

export const SHADCNCRAFT_PREFIX = "@shadcncraft/"

const ROOT = path.resolve(import.meta.dirname, "../..")

/**
 * The CLI exits before a piped stdout drains, cutting it at 64 KB, so its
 * output goes to a file instead.
 */
export function viewShadcncraftItems(names: string[]): RegistryItem[] {
  const dir = mkdtempSync(path.join(tmpdir(), "shadcncraft-"))
  const file = path.join(dir, "view.json")
  const fd = openSync(file, "w")
  try {
    execFileSync(
      "pnpm",
      [
        "dlx",
        "shadcn@latest",
        "view",
        ...names.map((n) => SHADCNCRAFT_PREFIX + n),
      ],
      { cwd: ROOT, stdio: ["ignore", fd, "inherit"] }
    )
  } finally {
    closeSync(fd)
  }
  const out = readFileSync(file, "utf8")
  rmSync(dir, { recursive: true })
  return JSON.parse(out.slice(out.indexOf("["))) as RegistryItem[]
}
