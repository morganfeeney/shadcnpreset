import { HomeHero } from "@/components/home-hero"
import { DefaultLayout } from "@/components/default-layout"
import { HomeHeroButtons } from "@/app/(home)/components"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function HomePage() {
  return (
    <DefaultLayout>
      <HomeHero>
        <HomeHeroButtons />
      </HomeHero>
    </DefaultLayout>
  )
}
