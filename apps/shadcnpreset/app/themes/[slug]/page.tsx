import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowUpRightIcon,
  CaretLeftIcon,
  CaretRightIcon,
} from "@phosphor-icons/react/ssr"

import { ThemeCopyActions } from "@/components/themes/theme-copy-actions"
import { ThemePicker, ThemeSidebar } from "@/components/themes/theme-nav"
import { ThemePalette, ThemeShowcase } from "@/components/themes/theme-preview"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { siteConfig } from "@/lib/config"
import { buildPageMetadata } from "@/lib/page-metadata"
import { presetThemeCommand, type PresetTheme } from "@/lib/preset-themes"
import {
  getPresetThemePage,
  getPresetThemesFeed,
} from "@/lib/preset-themes-feed"

type ThemePageProps = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const themes = await getPresetThemesFeed()
  return themes.map((theme) => ({ slug: theme.slug }))
}

export async function generateMetadata({
  params,
}: ThemePageProps): Promise<Metadata> {
  const { slug } = await params
  const page = await getPresetThemePage(slug)
  if (!page) notFound()

  const { theme, listed } = page
  const path = `/themes/${theme.slug}`
  const qualifiers = theme.qualifiers.length
    ? ` (${theme.qualifiers.join(", ")})`
    : ""

  return {
    ...buildPageMetadata({
      title: `${theme.name} shadcn theme${qualifiers}`,
      description: `${theme.description} Copy the CSS or apply it with the shadcn CLI.`,
      path,
    }),
    alternates: { canonical: path },
    // Valid themes outside the listing keep working but stay out of search.
    ...(listed ? {} : { robots: { index: false, follow: true } }),
  }
}

function FullPresetCard({ theme }: { theme: PresetTheme }) {
  return (
    <section className="flex flex-wrap items-center justify-between gap-6 rounded-xl border p-6">
      <div className="grid max-w-2xl gap-2">
        <h2 className="text-lg font-semibold">Want the whole look?</h2>
        <p className="text-sm text-muted-foreground">
          {theme.source ? (
            <>
              {theme.name} comes from preset{" "}
              <code className="font-mono">{theme.source.code}</code>, which also
              sets the {theme.source.style} component style, {theme.source.font}{" "}
              and {theme.source.icons}.
            </>
          ) : (
            <>
              Open {theme.name} as a preset to choose a component style, fonts
              and icons to go with it.
            </>
          )}
        </p>
      </div>
      <Button
        variant="outline"
        size="lg"
        nativeButton={false}
        render={<Link href={`/preset/${theme.code}`} />}
      >
        Open the preset
        <ArrowUpRightIcon aria-hidden />
      </Button>
    </section>
  )
}

export default async function ThemePage({ params }: ThemePageProps) {
  const { slug } = await params
  const [page, feed] = await Promise.all([
    getPresetThemePage(slug),
    getPresetThemesFeed(),
  ])
  if (!page) notFound()

  const { theme, listed } = page
  const items = feed.map((item) => ({
    slug: item.slug,
    name: item.name,
    details: item.details,
    baseColor: item.fields.baseColor,
    code: item.code,
  }))
  const index = feed.findIndex((item) => item.slug === theme.slug)
  const prev = listed ? feed.at(index - 1) : undefined
  const next = listed ? feed[(index + 1) % feed.length] : undefined
  const command = presetThemeCommand(theme.code)
  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "shadcn themes",
        item: `${siteConfig.url}/themes`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: theme.name,
        item: `${siteConfig.url}/themes/${theme.slug}`,
      },
    ],
  }

  return (
    <div className="flex items-start">
      <aside className="sticky top-0 hidden max-h-svh w-72 shrink-0 overflow-y-auto border-r p-3 lg:block">
        <ThemeSidebar items={items} currentSlug={theme.slug} />
      </aside>

      <main className="min-w-0 flex-1 pt-6 px-safe pb-20 lg:px-10">
        <div className="mx-auto grid max-w-6xl gap-12">
          <div className="grid gap-4">
            <ThemePicker
              items={items}
              currentSlug={theme.slug}
              className="lg:hidden"
            />
            <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
              <nav aria-label="Breadcrumb">
                <ol className="flex items-center gap-2">
                  <li>
                    <Link href="/themes" className="hover:text-foreground">
                      shadcn themes
                    </Link>
                  </li>
                  <li aria-hidden>/</li>
                  <li aria-current="page" className="text-foreground">
                    {theme.name}
                  </li>
                </ol>
              </nav>
              {prev && next ? (
                <div className="flex gap-1.5">
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label={`Previous theme: ${prev.name}`}
                    nativeButton={false}
                    render={<Link href={`/themes/${prev.slug}`} />}
                  >
                    <CaretLeftIcon aria-hidden />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label={`Next theme: ${next.name}`}
                    nativeButton={false}
                    render={<Link href={`/themes/${next.slug}`} />}
                  >
                    <CaretRightIcon aria-hidden />
                  </Button>
                </div>
              ) : null}
            </div>
          </div>

          <header className="flex flex-wrap items-end justify-between gap-8">
            <div className="grid max-w-3xl gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
                  {theme.name}
                </h1>
                <code className="rounded-md border px-2 py-0.5 font-mono text-xs text-muted-foreground">
                  {theme.code}
                </code>
              </div>
              <p className="text-lg text-muted-foreground">
                {theme.description}
              </p>
              <ul className="flex flex-wrap gap-2 text-xs">
                {theme.chips.map((chip) => (
                  <li
                    key={chip.label}
                    className="rounded-full bg-muted px-3 py-1"
                  >
                    <span className="text-muted-foreground">{chip.label}</span>{" "}
                    {chip.value}
                  </li>
                ))}
              </ul>
            </div>
            <ThemeCopyActions css={theme.css} command={command} />
          </header>

          <ThemeShowcase
            registryTheme={theme.registryTheme}
            name={theme.name}
          />

          <section className="grid gap-4">
            <h2 className="text-2xl font-semibold tracking-tight">Colors</h2>
            <ThemePalette registryTheme={theme.registryTheme} />
          </section>

          <section className="grid gap-4">
            <div className="grid gap-1.5">
              <h2 className="text-2xl font-semibold tracking-tight">
                Use this theme
              </h2>
              <p className="text-sm text-muted-foreground">
                Changes colors and radius only. Your components, fonts and icons
                stay as they are.
              </p>
            </div>
            <Tabs defaultValue="css">
              <TabsList>
                <TabsTrigger value="css">CSS</TabsTrigger>
                <TabsTrigger value="cli">shadcn CLI</TabsTrigger>
              </TabsList>
              <TabsContent value="css" className="grid gap-2">
                <p className="text-sm text-muted-foreground">
                  Replace the <code>:root</code> and <code>.dark</code> blocks
                  in your <code>globals.css</code>.
                </p>
                <pre className="max-h-96 overflow-auto rounded-xl border bg-muted/40 p-4 font-mono text-xs leading-relaxed">
                  {theme.css}
                </pre>
              </TabsContent>
              <TabsContent value="cli" className="grid gap-2">
                <p className="text-sm text-muted-foreground">
                  Run this in your project. <code>--only theme</code> applies
                  the colors and nothing else from the preset.
                </p>
                <pre className="overflow-x-auto rounded-xl border bg-muted/40 p-4 font-mono text-sm">
                  {command}
                </pre>
              </TabsContent>
            </Tabs>
          </section>

          <FullPresetCard theme={theme} />

          {prev && next ? (
            <nav
              aria-label="More themes"
              className="flex justify-between gap-4 border-t pt-6 text-sm"
            >
              <Link href={`/themes/${prev.slug}`} className="grid gap-1">
                <span className="text-xs text-muted-foreground">Previous</span>
                <span className="font-medium">{prev.name}</span>
              </Link>
              <Link
                href={`/themes/${next.slug}`}
                className="grid gap-1 text-right"
              >
                <span className="text-xs text-muted-foreground">Next</span>
                <span className="font-medium">{next.name}</span>
              </Link>
            </nav>
          ) : null}
        </div>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
        />
      </main>
    </div>
  )
}
