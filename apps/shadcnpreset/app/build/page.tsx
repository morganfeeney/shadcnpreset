import type { Metadata } from "next"

import { PageBuilder } from "@/components/page-builder/page-builder"
import { WideLayoutNoFooter } from "@/components/wide-layout-no-footer"
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

/** The assistant's shell: header on top, sidebar and page filling the rest. */
export default function BuildPage() {
  return (
    <WideLayoutNoFooter>
      <PageBuilder />
    </WideLayoutNoFooter>
  )
}
