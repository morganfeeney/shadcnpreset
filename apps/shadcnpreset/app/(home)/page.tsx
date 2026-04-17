import { HomeHero } from "@/components/home-hero"
import { DefaultLayout } from "@/components/default-layout"
import { HomeHeroButtons, HomePresetCarousel } from "@/app/(home)/components"
import { Features1 } from "@/components/zippystarter/features1"
import { getHomepageFeed } from "@/lib/preset-feed"

export const dynamic = "force-dynamic"
export const revalidate = 0

function formatTypographyLine(fontHeading: string, font: string) {
  if (fontHeading === "inherit" || fontHeading === font) {
    return `${font} font`
  }
  return `${fontHeading} & ${font} fonts`
}

export default async function HomePage() {
  const featuredPresets = await getHomepageFeed(8)

  return (
    <DefaultLayout>
      <HomeHero>
        <HomeHeroButtons />
      </HomeHero>
      <section className="py-8">
        <HomePresetCarousel
          items={featuredPresets.map((item) => ({
            code: item.code,
            title: item.code,
            description: `${item.config.baseColor} base, ${item.config.theme} theme, ${item.config.chartColor ?? item.config.theme} charts, ${item.config.iconLibrary}, ${formatTypographyLine(item.config.fontHeading, item.config.font)}`,
          }))}
        />
      </section>
      <Features1 />
    </DefaultLayout>
  )
}
