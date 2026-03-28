
import { HomeFeaturedSection } from "@/components/home-featured-section"
import { HomeLeaderboardSection } from "@/components/home-leaderboard-section"
import {
  PRESET_TOTAL_COMBINATIONS,
  getPresetPage,
  type PresetPageItem,
} from "@/lib/preset-catalog"
import { resolvePresetFromCode } from "@/lib/preset"
import { HomeHero } from "@/components/home-hero"

const CURATED_CODES = [
  "b4aRK5K0fb",
  "b4ZVZIPi9h",
  "a1D3DApV",
  "adbu3Hc",
] as const

function stableHash(input: string) {
  let hash = 2166136261
  for (let index = 0; index < input.length; index++) {
    hash ^= input.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

export default function HomePage() {
  const pool = getPresetPage(1, 140)
  const randomizedPool = [...pool].sort((a, b) => stableHash(a.code) - stableHash(b.code))

  const curatedItems: PresetPageItem[] = CURATED_CODES.map((code, index) => {
    const resolved = resolvePresetFromCode(code)
    if (!resolved) {
      return null
    }

    return {
      index: -1 - index,
      code: resolved.code,
      config: resolved,
    }
  }).filter((item): item is PresetPageItem => item !== null)

  const dedupeByCode = new Set(curatedItems.map((item) => item.code))
  const fallbackItems = randomizedPool.filter((item) => !dedupeByCode.has(item.code))

  const marqueeItems = [...curatedItems, ...fallbackItems].slice(0, 12)
  const featuredItems = curatedItems.length ? curatedItems : fallbackItems.slice(0, 6)
  const leaderboardSource = [...curatedItems, ...fallbackItems].slice(0, 30)
  const leaderboardItems = leaderboardSource.map((item) => ({
    code: item.code,
    href: `/preset/${item.code}`,
    label: `${item.config.style} / ${item.config.theme}`,
  }))

  return (
    <div
      data-slot="layout"
      className="group/layout section-soft relative z-10 mx-auto grid w-full max-w-[1800px] gap-(--gap) p-(--gap) [--gap:--spacing(4)] md:[--gap:--spacing(6)] 2xl:[--customizer-width:--spacing(56)]"
    >
      <HomeHero />

      <main className="space-y-8 md:space-y-10">
        <HomeFeaturedSection items={featuredItems} />
        <HomeLeaderboardSection items={leaderboardItems} />
      </main>
    </div>
  )
}
