import { NextResponse } from "next/server"

import { getSearchPageData } from "@/lib/search-data"
import { isSearchMode } from "@/lib/search-route"

function parsePositiveInt(value: string, fallback: number) {
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
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
  const payload = await getSearchPageData(mode, query, requestedPage)

  return NextResponse.json(payload)
}
