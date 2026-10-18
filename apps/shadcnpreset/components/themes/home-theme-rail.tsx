"use client"

import Link from "next/link"
import { ArrowRightIcon } from "@phosphor-icons/react"

import { HomeRailCarousel } from "@/app/(home)/components"
import { HomeSection } from "@/app/(home)/home-section"
import { ThemeTile } from "@/components/themes/themes-grid"
import { HomePresetRailItem } from "@/components/ui/home-preset-rail"
import type { PresetThemeSummary } from "@/lib/preset-themes"

/**
 * Homepage themes in a {@link HomeSection}, with a rail that breaks out to the
 * full width like the featured presets; each tile links to its theme page.
 */
export function HomeThemeRail({
  themes,
  total,
}: {
  themes: PresetThemeSummary[]
  total: number
}) {
  return (
    // `min-w-0` here and on the rail's wrapper stops the full-width rail from
    // widening the grid tracks it sits in.
    <div className="min-w-0">
      <HomeSection title="shadcn themes" subTitle="Ready to copy and paste">
        <div className="min-w-0">
          <HomeRailCarousel
            viewportId="home-themes-carousel"
            itemCount={themes.length}
            label="Themes"
            prevLabel="Previous themes"
            nextLabel="Next themes"
            className="mx-[calc(50%-50vw)] rail-edge-safe-padding w-screen max-w-none"
          >
            {themes.map((theme) => (
              <HomePresetRailItem
                key={theme.slug}
                className="w-80 md:max-w-none lg:max-w-none"
              >
                <ThemeTile theme={theme} placement="home_rail" />
              </HomePresetRailItem>
            ))}
          </HomeRailCarousel>
        </div>
        <Link
          href="/themes"
          className="flex items-center gap-2 justify-self-start text-sm @6xl:text-base"
        >
          Browse all {total} themes
          <ArrowRightIcon size={16} />
        </Link>
      </HomeSection>
    </div>
  )
}
