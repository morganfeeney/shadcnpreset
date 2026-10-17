import type { Metadata } from "next"
import Link from "next/link"
import { cacheLife } from "next/cache"

import { getLearnArticleHref } from "@/app/learn/learn"
import { PRESET_THEME_GENERATOR_TOOL } from "@/app/tools/tools"
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/page-header"
import { ThemesGrid } from "@/components/themes/themes-grid"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { buildPageMetadata } from "@/lib/page-metadata"
import { getPresetThemesFeed } from "@/lib/preset-themes-feed"

const description =
  "Free color themes for shadcn/ui, taken from community presets. Preview each theme, copy its CSS variables for light and dark mode, or apply it with the shadcn CLI."

export const metadata: Metadata = {
  ...buildPageMetadata({
    title: "shadcn themes: free color themes for shadcn/ui",
    description,
    path: "/themes",
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
        <PageHeader>
          <PageHeaderHeading className="max-w-4xl">
            shadcn themes
          </PageHeaderHeading>
          <PageHeaderDescription className="max-w-3xl text-muted-foreground">
            {description}{" "}
            <Link href="#theme-or-preset" className={inlineLink}>
              Theme or preset?
            </Link>{" "}
            Have a preset code? Use the{" "}
            <Link
              href={PRESET_THEME_GENERATOR_TOOL.href}
              className={inlineLink}
            >
              {PRESET_THEME_GENERATOR_TOOL.title}
            </Link>
            .
          </PageHeaderDescription>
        </PageHeader>

        <ThemesGrid
          items={themes.map((theme) => ({
            slug: theme.slug,
            name: theme.name,
            details: theme.details,
            baseColor: theme.fields.baseColor,
            code: theme.code,
          }))}
        />

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
