import { HomeHero } from "@/components/home-hero"
import { DefaultLayout } from "@/components/default-layout"
import { HomeHeroButtons } from "@/app/(home)/components"
import { Features1 } from "@/components/zippystarter/features1"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function HomePage() {
  return (
    <DefaultLayout>
      <HomeHero>
        <HomeHeroButtons />
      </HomeHero>
      <Features1 />
    </DefaultLayout>
  )
}
