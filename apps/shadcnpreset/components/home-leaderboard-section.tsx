import { Grid2x2, Sparkles, Trophy } from "lucide-react"

import { PresetLoveLeaderboard } from "@/components/preset-love-leaderboard"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type LeaderboardItem = {
  code: string
  label: string
  href: string
}

type HomeLeaderboardSectionProps = {
  items: LeaderboardItem[]
}

export function HomeLeaderboardSection({ items }: HomeLeaderboardSectionProps) {
  return (
    <section className="grid gap-4 md:grid-cols-[1fr_1.2fr]">
      <Card>
        <CardHeader>
          <CardTitle className="inline-flex items-center gap-2">
            <Trophy className="size-4 text-amber-500" />
            Most loved presets
          </CardTitle>
          <CardDescription>
            Ranked from local votes collected on your browser.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PresetLoveLeaderboard items={items} />
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="sm:col-span-3">
          <CardHeader>
            <CardTitle className="inline-flex items-center gap-2">
              <Sparkles className="size-4" />
              Curation layers
            </CardTitle>
            <CardDescription>
              Home now highlights quality first, while full filtering lives in browse.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="inline-flex items-center gap-2">
              <Grid2x2 className="size-4" />
              Feature cards
            </CardTitle>
            <CardDescription>Handpicked combinations with full previews.</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Marquee feed</CardTitle>
            <CardDescription>Quick scan of curated preset links.</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Full catalog</CardTitle>
            <CardDescription>
              Open `Browse all presets` to filter the complete generated set.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </section>
  )
}
