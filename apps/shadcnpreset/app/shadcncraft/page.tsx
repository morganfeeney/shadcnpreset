import type { Metadata } from "next"
import { isPresetCode } from "shadcn/preset"

import { DefaultLayout } from "@/components/default-layout"
import { ShadcncraftPitch } from "@/components/shadcncraft-pitch/pitch"
import { buildPageMetadata } from "@/lib/page-metadata"

export const metadata: Metadata = {
  ...buildPageMetadata({
    title: "shadcncraft Pro for your shadcn preset",
    description:
      "shadcncraft Pro: shadcn/ui blocks, components and a Figma kit that match one to one, with a plugin that applies shadcn presets.",
    path: "/shadcncraft",
  }),
  // A preset in the query only fills in a step; it is all this one page.
  alternates: { canonical: "/shadcncraft" },
}

/**
 * The shadcncraft pitch on a page of its own, for links and search. A link
 * from a preset can send its code along, for the steps to offer.
 */
export default async function ShadcncraftPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { preset } = await searchParams
  const presetCode =
    typeof preset === "string" && isPresetCode(preset) ? preset : undefined

  return (
    <DefaultLayout>
      <main className="py-12">
        <ShadcncraftPitch
          presetCode={presetCode}
          placement="pitch-page"
          headingLevel="h1"
        />
      </main>
    </DefaultLayout>
  )
}
