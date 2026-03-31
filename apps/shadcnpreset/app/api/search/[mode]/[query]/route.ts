import { NextResponse } from "next/server"

import { getSearchPageData } from "@/lib/search-data"
import { isSearchMode } from "@/lib/search-route"

export async function GET(
  _request: Request,
  context: {
    params: Promise<{ mode: string; query: string }>
  }
) {
  const { mode, query: rawQuery } = await context.params

  if (!isSearchMode(mode)) {
    return NextResponse.json({ error: "Invalid search mode" }, { status: 400 })
  }

  const query = rawQuery.trim()
  if (!query) {
    return NextResponse.json({ error: "Missing search query" }, { status: 400 })
  }

  const payload = await getSearchPageData(mode, query)

  return NextResponse.json(payload)
}
