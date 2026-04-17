import { HomeHero } from "@/components/home-hero"
import { ListLayout } from "@/components/list-layout"
import { HomeHeroButtons } from "@/app/(home)/components"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function HomePage() {
  return (
    <ListLayout>
      <HomeHero>
        <HomeHeroButtons />
      </HomeHero>
    </ListLayout>
  )
}
