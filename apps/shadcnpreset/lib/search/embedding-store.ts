import { existsSync, readFileSync } from "node:fs"
import path from "node:path"

export type PresetEmbeddingFile = {
  model: string
  dim: number
  vectors: Record<string, number[]>
}

let cache: Map<string, number[]> | null = null
let cacheMeta: { model: string; dim: number; sourcePath: string } | null =
  null

function candidatePaths(): string[] {
  return [
    path.join(process.cwd(), "data", "preset-embeddings.json"),
    path.join(
      process.cwd(),
      "apps",
      "shadcnpreset",
      "data",
      "preset-embeddings.json"
    ),
  ]
}

/** Clear cache (e.g. tests). */
export function clearPresetEmbeddingStoreCache(): void {
  cache = null
  cacheMeta = null
}

/**
 * Load precomputed preset vectors (from `pnpm generate:preset-embeddings`).
 * Returns null if the file is missing or invalid.
 */
export function loadPresetEmbeddingStore():
  | { vectors: Map<string, number[]>; model: string; dim: number }
  | null {
  if (cache && cacheMeta) {
    return {
      vectors: cache,
      model: cacheMeta.model,
      dim: cacheMeta.dim,
    }
  }

  let filePath: string | null = null
  for (const p of candidatePaths()) {
    if (existsSync(p)) {
      filePath = p
      break
    }
  }
  if (!filePath) return null

  try {
    const raw = readFileSync(filePath, "utf8")
    const data = JSON.parse(raw) as PresetEmbeddingFile
    if (
      !data.model ||
      typeof data.dim !== "number" ||
      !data.vectors ||
      typeof data.vectors !== "object"
    ) {
      return null
    }

    const m = new Map<string, number[]>()
    for (const [code, vec] of Object.entries(data.vectors)) {
      if (Array.isArray(vec) && vec.length === data.dim) {
        m.set(code, vec)
      }
    }
    if (m.size === 0) return null

    cache = m
    cacheMeta = { model: data.model, dim: data.dim, sourcePath: filePath }
    return { vectors: m, model: data.model, dim: data.dim }
  } catch {
    return null
  }
}
