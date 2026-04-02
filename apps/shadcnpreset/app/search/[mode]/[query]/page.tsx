import { Suspense } from "react"
import { redirect } from "next/navigation"

import { HomeHero } from "@/components/home-hero"
import { PresetForm } from "@/components/preset-form"
import { PresetFormSkeleton } from "@/components/preset-form-skeleton"
import { ListLayout } from "@/components/list-layout"
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
    redirect("/")
  }

  let query = resolvedParams.query.trim()
  try {
    query = decodeURIComponent(query.replace(/\+/g, "%20"))
  } catch {
    /* keep trimmed segment */
  }
  query = query.trim()
  if (!query) {
    redirect("/")
  }

  return (
    <ListLayout>
      <HomeHero>
        <Suspense fallback={<PresetFormSkeleton />}>
          <PresetForm className="pt-2" />
        </Suspense>
      </HomeHero>
      <SearchResultsClient mode={resolvedParams.mode} query={query} />
    </ListLayout>
  )
}
