import { query } from "@/lib/db"
import { resolvePresetFromCode } from "@/lib/preset"
import {
  PRESET_FILTER_OPTIONS,
  getPresetPage,
  type PresetFilters,
  type PresetPageItem,
} from "@/lib/preset-catalog"

type VoteRow = {
  preset_code: string
}

const SEARCH_CORPUS_LIMIT = 2400
const LOVED_SAMPLE_LIMIT = 400
const GENERAL_PAGE_COUNT = 10
const GENERAL_PAGE_SIZE = 100
const SEARCH_CORPUS_TTL_MS = 5 * 60 * 1000

let cachedCorpus: PresetPageItem[] | null = null
let cachedCorpusAt = 0
let pendingCorpus: Promise<PresetPageItem[]> | null = null

async function getLovedPresetItems(limit: number): Promise<PresetPageItem[]> {
  const result = await query<VoteRow>(
    `
    SELECT preset_code
    FROM preset_votes
    GROUP BY preset_code
    ORDER BY COUNT(*) DESC, preset_code ASC
    LIMIT $1
    `,
    [limit]
  )

  const items: PresetPageItem[] = []
  for (const row of result.rows) {
    const preset = resolvePresetFromCode(row.preset_code)
    if (!preset) continue

    items.push({
      index: items.length,
      code: preset.code,
      config: preset,
    })
  }

  return items
}

function addItems(
  byCode: Map<string, PresetPageItem>,
  items: PresetPageItem[],
  limit: number
) {
  for (const item of items) {
    if (byCode.has(item.code)) continue

    byCode.set(item.code, {
      ...item,
      index: byCode.size,
    })

    if (byCode.size >= limit) {
      break
    }
  }
}

function addVariantPage(
  byCode: Map<string, PresetPageItem>,
  filters: PresetFilters,
  pageSize: number,
  limit: number
) {
  if (byCode.size >= limit) return
  addItems(byCode, getPresetPage(1, pageSize, filters), limit)
}

async function buildSearchCorpusFresh(): Promise<PresetPageItem[]> {
  const byCode = new Map<string, PresetPageItem>()

  addItems(byCode, await getLovedPresetItems(LOVED_SAMPLE_LIMIT), SEARCH_CORPUS_LIMIT)

  for (let page = 1; page <= GENERAL_PAGE_COUNT && byCode.size < SEARCH_CORPUS_LIMIT; page++) {
    addItems(byCode, getPresetPage(page, GENERAL_PAGE_SIZE), SEARCH_CORPUS_LIMIT)
  }

  for (const style of PRESET_FILTER_OPTIONS.styles) {
    addVariantPage(byCode, { style }, 24, SEARCH_CORPUS_LIMIT)
  }

  for (const baseColor of PRESET_FILTER_OPTIONS.baseColors) {
    addVariantPage(byCode, { baseColor }, 20, SEARCH_CORPUS_LIMIT)
  }

  for (const iconLibrary of PRESET_FILTER_OPTIONS.iconLibraries) {
    addVariantPage(byCode, { iconLibrary }, 20, SEARCH_CORPUS_LIMIT)
  }

  for (const radius of PRESET_FILTER_OPTIONS.radii) {
    addVariantPage(byCode, { radius }, 18, SEARCH_CORPUS_LIMIT)
  }

  for (const theme of PRESET_FILTER_OPTIONS.themes) {
    addVariantPage(byCode, { theme }, 12, SEARCH_CORPUS_LIMIT)
  }

  for (const font of PRESET_FILTER_OPTIONS.fonts) {
    addVariantPage(byCode, { font }, 12, SEARCH_CORPUS_LIMIT)
  }

  return [...byCode.values()].map((item, index) => ({
    ...item,
    index,
  }))
}

export async function buildSearchCorpus() {
  const now = Date.now()
  if (cachedCorpus && now - cachedCorpusAt < SEARCH_CORPUS_TTL_MS) {
    return cachedCorpus
  }

  if (!pendingCorpus) {
    pendingCorpus = buildSearchCorpusFresh()
      .then((items) => {
        cachedCorpus = items
        cachedCorpusAt = Date.now()
        return items
      })
      .finally(() => {
        pendingCorpus = null
      })
  }

  return pendingCorpus
}
