/**
 * Checks out the shadcncraft blocks — licensed, so kept in a private repo —
 * into components/shadcncraft/, at the commit pinned in shadcncraft.lock.
 *
 *   pnpm sync:shadcncraft          # clone or move to the pin
 *   pnpm sync:shadcncraft --pin    # pin the checkout's commit (push it first)
 *
 * Locally it clones over SSH with your GitHub key. Builds and CI set
 * SHADCNCRAFT_REPO_TOKEN, a token that can read only that repo.
 *
 * It never discards work: a checkout with uncommitted edits, or with commits
 * newer than the pin, is left as it is.
 */
import { execFileSync } from "node:child_process"
import { existsSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"

const REPO = "morganfeeney/shadcnpreset-shadcncraft"
const ROOT = path.resolve(import.meta.dirname, "..")
const DIR = path.join(ROOT, "components/shadcncraft")
const LOCK = path.join(ROOT, "shadcncraft.lock")

function git(args: string[], cwd = DIR): string {
  return execFileSync("git", args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim()
}

function succeeds(args: string[]): boolean {
  try {
    git(args)
    return true
  } catch {
    return false
  }
}

function pinned(): string {
  return readFileSync(LOCK, "utf8").trim()
}

function pin() {
  const head = git(["rev-parse", "HEAD"])
  // A pin nobody else can fetch would break every build but yours.
  git(["fetch", "--quiet", "origin"])
  if (!git(["branch", "-r", "--contains", head])) {
    throw new Error(`${head.slice(0, 7)} is not pushed. Push it, then pin.`)
  }
  writeFileSync(LOCK, `${head}\n`)
  console.log(
    `Pinned shadcncraft at ${head.slice(0, 7)}. Commit shadcncraft.lock.`
  )
}

function clone(sha: string) {
  const token = process.env.SHADCNCRAFT_REPO_TOKEN?.trim()
  const url = token
    ? `https://x-access-token:${token}@github.com/${REPO}.git`
    : `git@github.com:${REPO}.git`
  try {
    git(["clone", "--quiet", url, DIR], ROOT)
  } catch (error) {
    throw new Error(
      `Could not clone ${REPO}. Locally, check your GitHub SSH key can read it; ` +
        `on Vercel or in CI, set SHADCNCRAFT_REPO_TOKEN.\n${(error as Error).message}`
    )
  }
  // Keep the token out of the checkout's config.
  if (token)
    git(["remote", "set-url", "origin", `https://github.com/${REPO}.git`])
  git(["checkout", "--quiet", sha])
  console.log(`Checked out shadcncraft at ${sha.slice(0, 7)}.`)
}

function update(sha: string) {
  const head = git(["rev-parse", "HEAD"])
  if (head === sha) {
    console.log(`shadcncraft is at the pin (${sha.slice(0, 7)}).`)
    return
  }
  if (git(["status", "--porcelain"])) {
    console.warn(
      "shadcncraft has uncommitted edits, so it stays as it is. " +
        "Commit and push them there, then `pnpm sync:shadcncraft --pin`."
    )
    return
  }
  if (!succeeds(["cat-file", "-e", `${sha}^{commit}`])) {
    git(["fetch", "--quiet", "origin"])
  }
  if (head !== sha && succeeds(["merge-base", "--is-ancestor", sha, head])) {
    console.warn(
      `shadcncraft is ahead of the pin (${head.slice(0, 7)} after ${sha.slice(0, 7)}), ` +
        "so it stays as it is. Push, then `pnpm sync:shadcncraft --pin`."
    )
    return
  }
  git(["checkout", "--quiet", sha])
  console.log(`Moved shadcncraft to the pin (${sha.slice(0, 7)}).`)
}

function main() {
  if (process.argv.includes("--pin")) return pin()
  const sha = pinned()
  if (existsSync(path.join(DIR, ".git"))) update(sha)
  else clone(sha)
}

try {
  main()
} catch (error) {
  console.error((error as Error).message)
  process.exit(1)
}
