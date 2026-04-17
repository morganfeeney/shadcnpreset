/**
 * Run from apps/shadcnpreset:
 *   pnpm verify:search -- "hugeicons pink"
 *
 * Loads `.env.local` when present so DATABASE_URL matches the dev server.
 * This exercises the same getSearchPageData() path as the API route, without the browser.
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.join(__dirname, "..", ".env.local")
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    if (!line || line.startsWith("#")) continue
    const idx = line.indexOf("=")
    if (idx === -1) continue
    const key = line.slice(0, idx)
    const value = line.slice(idx + 1)
    if (!process.env[key]) process.env[key] = value
  }
}

const { getSearchPageData } = await import("../lib/search/data")

const argv = process.argv.slice(2).filter((arg) => arg !== "--")
const query = argv.join(" ").trim() || "hugeicons pink"

const data = await getSearchPageData("smart", query)
console.log(JSON.stringify({ query: data.query, count: data.items.length, items: data.items }, null, 2))
