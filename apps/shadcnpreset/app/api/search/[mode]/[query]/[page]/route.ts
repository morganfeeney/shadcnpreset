import { NextResponse } from "next/server"

import { type PresetPageItem } from "@/lib/preset-catalog"
import { resolvePresetFromCode } from "@/lib/preset"
import { getSmartPresetResults } from "@/lib/preset-smart-search"
import { isSearchMode, SEARCH_PAGE_SIZE } from "@/lib/search-route"

type SearchPayload = {
  mode: "code" | "smart"
  query: string
  safePage: number
  totalPages: number
  totalResults: number
  items: PresetPageItem[]
}

function parsePositiveInt(value: string, fallback: number) {
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

function getSearchItems(mode: "code" | "smart", query: string) {
  if (mode === "code") {
    const resolved = resolvePresetFromCode(query)
    if (!resolved) {
      return [] as PresetPageItem[]
    }
    return [{ index: 0, code: resolved.code, config: resolved }]
  }

  return getSmartPresetResults(query, {}, 360)
}

export async function GET(
  _request: Request,
  context: {
    params: Promise<{ mode: string; query: string; page: string }>
  }
) {
  const { mode, query: rawQuery, page: rawPage } = await context.params

  if (!isSearchMode(mode)) {
    return NextResponse.json({ error: "Invalid search mode" }, { status: 400 })
  }

  const query = rawQuery.trim()
  if (!query) {
    return NextResponse.json({ error: "Missing search query" }, { status: 400 })
  }

  const requestedPage = parsePositiveInt(rawPage, 1)
  const allItems = getSearchItems(mode, query)
  const totalResults = allItems.length
  const totalPages = Math.max(1, Math.ceil(totalResults / SEARCH_PAGE_SIZE))
  const safePage = Math.min(requestedPage, totalPages)

  const start = (safePage - 1) * SEARCH_PAGE_SIZE
  const end = start + SEARCH_PAGE_SIZE
  const items = allItems.slice(start, end)

  const payload: SearchPayload = {
    mode,
    query,
    safePage,
    totalPages,
    totalResults,
    items,
  }

  return NextResponse.json(payload)
}
