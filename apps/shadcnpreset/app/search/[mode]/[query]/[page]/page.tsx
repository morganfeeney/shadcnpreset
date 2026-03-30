import { notFound } from "next/navigation"

import { HomeHero } from "@/components/home-hero"
import { HomeLayout } from "@/components/home-layout"
import { isSearchMode } from "@/lib/search-route"
import { SearchResultsClient } from "./search-results-client"

type SearchPageProps = {
  params: Promise<{
    mode: string
    query: string
    page: string
  }>
}

function parsePositiveInt(value: string, fallback: number) {
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

export default async function SearchPage({ params }: SearchPageProps) {
  const resolvedParams = await params

  if (!isSearchMode(resolvedParams.mode)) {
    notFound()
  }

  const query = resolvedParams.query.trim()
  if (!query) {
    notFound()
  }

  const requestedPage = parsePositiveInt(resolvedParams.page, 1)

  return (
    <HomeLayout>
      <HomeHero />
      <SearchResultsClient
        mode={resolvedParams.mode}
        query={query}
        requestedPage={requestedPage}
      />
    </HomeLayout>
  )
}
