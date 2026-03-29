import { NextResponse } from "next/server"

import { getPresetFeedPage } from "@/lib/preset-feed"

function parsePositiveInt(value: string | null, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = parsePositiveInt(searchParams.get("page"), 1)
  const size = Math.min(60, parsePositiveInt(searchParams.get("size"), 24))

  const feed = await getPresetFeedPage(page, size)

  return NextResponse.json(feed)
}
