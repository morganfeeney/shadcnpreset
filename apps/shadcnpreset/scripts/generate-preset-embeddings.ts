/**
 * One-time / CI: embed every preset in the search corpus and write
 * `data/preset-embeddings.json`. Run from apps/shadcnpreset:
 *
 *   pnpm generate:preset-embeddings
 *
 * Needs OPENAI_API_KEY and DATABASE_URL (same as dev server).
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { embedMany } from "ai"
import { openai } from "@ai-sdk/openai"

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

const EMBEDDING_MODEL =
  process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-small"
const BATCH = 96

async function main() {
  if (!process.env.OPENAI_API_KEY?.trim()) {
    console.error("OPENAI_API_KEY is required")
    process.exit(1)
  }

  const { buildSearchCorpus } = await import("../lib/search/corpus")
  const { buildPresetSearchDocument } = await import("../lib/search/document")

  const corpus = await buildSearchCorpus()
  const model = openai.embedding(EMBEDDING_MODEL)

  const rows: { code: string; text: string }[] = corpus.map((item) => ({
    code: item.code,
    text: buildPresetSearchDocument(item),
  }))

  const vectors: Record<string, number[]> = {}
  let dim = 0

  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH)
    const { embeddings } = await embedMany({
      model,
      values: batch.map((b) => b.text),
      maxRetries: 1,
    })
    for (let j = 0; j < batch.length; j++) {
      const emb = embeddings[j]
      const row = batch[j]!
      if (emb) {
        const arr = [...emb]
        if (!dim) dim = arr.length
        vectors[row.code] = arr
      }
    }
    process.stdout.write(
      `\rEmbedded ${Math.min(i + BATCH, rows.length)} / ${rows.length}`
    )
  }
  process.stdout.write("\n")

  const outDir = path.join(__dirname, "..", "data")
  fs.mkdirSync(outDir, { recursive: true })
  const outPath = path.join(outDir, "preset-embeddings.json")
  const payload = {
    model: EMBEDDING_MODEL,
    dim,
    generatedAt: new Date().toISOString(),
    count: Object.keys(vectors).length,
    vectors,
  }
  fs.writeFileSync(outPath, JSON.stringify(payload), "utf8")
  console.log(`Wrote ${payload.count} vectors (${dim}d) → ${outPath}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
