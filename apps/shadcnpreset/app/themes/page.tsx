import type { Metadata } from "next"
import Link from "next/link"
import { cacheLife } from "next/cache"

import { getLearnArticleHref } from "@/app/learn/learn"
import { PRESET_THEME_GENERATOR_TOOL } from "@/app/tools/tools"
import {
  PageActions,
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/page-header"
import { ThemesGrid } from "@/components/themes/themes-grid"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { buildPageMetadata } from "@/lib/page-metadata"
import { presetThemeSummary } from "@/lib/preset-themes"
import { getPresetThemesFeed } from "@/lib/preset-themes-feed"

const description =
  "Free color themes for shadcn/ui, taken from community presets. Preview each theme, copy its CSS variables for light and dark mode, or apply it with the shadcn CLI."

export const metadata: Metadata = {
  ...buildPageMetadata({
    title: "shadcn themes: free color themes for shadcn/ui",
    description,
    path: "/themes",
    image: "route",
  }),
  alternates: { canonical: "/themes" },
}

const COMPARE = [
  ["Colors in light and dark mode", true],
  ["Radius", true],
  ["Chart colors", true],
  ["Component style", false],
  ["Fonts", false],
  ["Icon library", false],
] as const

const inlineLink =
  "font-medium text-foreground underline-offset-4 hover:underline"

export default async function ThemesPage() {
  "use cache"
  cacheLife({ stale: 300, revalidate: 300, expire: 86400 })

  const themes = await getPresetThemesFeed()

  return (
    <main className="px-safe pb-20">
      <div className="mx-auto grid max-w-7xl gap-10">
        <PageHeader className="[&_.container]:pb-6 lg:[&_.container]:pb-12">
          <PageHeaderHeading className="max-w-4xl">
            {themes.length} free shadcn themes{" "}
            <span className="block text-muted-foreground">
              from community presets
            </span>
          </PageHeaderHeading>
          <PageHeaderDescription className="max-w-2xl text-muted-foreground">
            The color layer of the most voted presets. Preview a theme, copy its
            CSS variables for light and dark mode, or apply it with one shadcn
            command.
          </PageHeaderDescription>
        </PageHeader>

        <ThemesGrid items={themes.map(presetThemeSummary)} />

        <section
          id="theme-or-preset"
          className="grid scroll-mt-24 gap-8 border-t pt-12 md:grid-cols-[1fr_1.6fr]"
        >
          <div className="grid content-start gap-3">
            <h2 className="text-2xl font-semibold tracking-tight">
              Theme or preset?
            </h2>
            <p className="text-muted-foreground">
              A theme only changes colors and radius. A preset is the whole
              setup, including the component style, fonts and icons. Every theme
              here links to the preset it came from.
            </p>
            <Link
              href={getLearnArticleHref("what-is-a-shadcn-preset")}
              className={inlineLink}
            >
              What is a shadcn preset?
            </Link>
          </div>
          <div className="overflow-hidden rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>What it changes</TableHead>
                  <TableHead className="text-center">Theme</TableHead>
                  <TableHead className="text-center">Preset</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {COMPARE.map(([label, inTheme]) => (
                  <TableRow key={label}>
                    <TableCell>{label}</TableCell>
                    <TableCell
                      className={
                        inTheme
                          ? "text-center font-medium"
                          : "text-center text-muted-foreground"
                      }
                    >
                      {inTheme ? "Yes" : "No"}
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      Yes
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
      </div>
    </main>
  )
}
