import type { Metadata } from "next"

import { PageBuilder } from "@/components/page-builder/page-builder"
import { Toaster } from "@/components/ui/sonner"
import { WideLayoutNoFooter } from "@/components/wide-layout-no-footer"
import { readSavedPage } from "@/lib/page-builder/saved-page"
import { buildPageMetadata } from "@/lib/page-metadata"

export const metadata: Metadata = {
  ...buildPageMetadata({
    title: "Build a page with Jev",
    description:
      "Describe a page and Jev assembles it from shadcncraft blocks, dressed in a shadcn preset you can swap.",
    path: "/build",
  }),
  // A prototype: reachable by link, kept out of search until it earns a place.
  robots: { index: false },
}

/**
 * The assistant's shell: header on top, sidebar and page filling the rest.
 * A saved page in the URL is read here, so it renders in the first paint.
 */
export default async function BuildPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  return (
    <WideLayoutNoFooter>
      <PageBuilder saved={readSavedPage(await searchParams)} />
      <Toaster />
    </WideLayoutNoFooter>
  )
}
