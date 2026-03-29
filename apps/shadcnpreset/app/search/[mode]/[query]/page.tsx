import { notFound, redirect } from "next/navigation"

import { buildSearchHref, isSearchMode } from "@/lib/search-route"

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

  redirect(buildSearchHref(resolvedParams.mode, query, 1))
}
