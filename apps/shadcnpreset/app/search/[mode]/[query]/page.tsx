import { notFound } from "next/navigation"

import { HomeHero } from "@/components/home-hero"
import { HomeLayout } from "@/components/home-layout"
import { isSearchMode } from "@/lib/search-route"
import { SearchResultsClient } from "./search-results-client"

type SearchBasePageProps = {
  params: Promise<{
    mode: string
    query: string
  }>
}

export default async function SearchBasePage({ params }: SearchBasePageProps) {
  const resolvedParams = await params

  if (!isSearchMode(resolvedParams.mode)) {
    notFound()
  }

  const query = resolvedParams.query.trim()
  if (!query) {
    notFound()
  }

  return (
    <HomeLayout>
      <HomeHero />
      <SearchResultsClient mode={resolvedParams.mode} query={query} />
    </HomeLayout>
  )
}
