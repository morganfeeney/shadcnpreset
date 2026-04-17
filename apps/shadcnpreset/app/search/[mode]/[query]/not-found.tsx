"use client"

import Link from "next/link"
import { useParams } from "next/navigation"

import { SMART_SEARCH_SUGGESTIONS } from "@/lib/search/suggestions"
import {
  buildHomeNewSearchHref,
  buildSearchHref,
  decodeSearchQuerySegment,
} from "@/lib/search/route"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Search } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"

function segmentParam(value: string | string[] | undefined) {
  if (typeof value === "string") return value
  if (Array.isArray(value) && value[0]) return value[0]
  return ""
}

export default function QueryNotFound() {
  const params = useParams()
  const queryRaw = segmentParam(params.query)

  const keyword = decodeSearchQuerySegment(queryRaw)

  const normalizedKeyword = keyword.trim().toLowerCase()
  const suggestionLinks = SMART_SEARCH_SUGGESTIONS.filter(
    (s) => s.query.trim().toLowerCase() !== normalizedKeyword
  )
  const links =
    suggestionLinks.length > 0 ? suggestionLinks : [...SMART_SEARCH_SUGGESTIONS]

  return (
    <main className="mx-auto grid w-full max-w-450 gap-4 px-safe">
      <Empty className="border border-border">
        <EmptyMedia variant="icon">
          <Search className="text-muted-foreground" />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle className="text-2xl">
            No results were found for &quot;{keyword}&quot;
          </EmptyTitle>
          <EmptyDescription>
            Try different words,{" "}
            <Link href={buildHomeNewSearchHref("smart")}>
              start a new search
            </Link>
            , or explore one of these example searches.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <ul className="flex flex-wrap justify-center gap-2">
            {links.map(({ label, query: suggestionQuery }) => (
              <li key={suggestionQuery}>
                <Link
                  href={buildSearchHref("smart", suggestionQuery)}
                  className={buttonVariants({ variant: "outline" })}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </EmptyContent>
      </Empty>
    </main>
  )
}
