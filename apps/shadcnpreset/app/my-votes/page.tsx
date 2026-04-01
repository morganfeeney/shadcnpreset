import { Heart } from "lucide-react"

import { HomeLayout } from "@/components/home-layout"
import { ListView } from "@/components/list-view"
import { MyVotesSignInPrompt } from "@/components/my-votes-sign-in-prompt"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { getSessionUser } from "@/lib/auth"
import { getVotedPresetsForUser } from "@/lib/user-votes"

export const dynamic = "force-dynamic"

export default async function MyVotesPage() {
  const user = await getSessionUser()

  if (!user) {
    return (
      <HomeLayout>
        <main className="grid gap-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              My votes
            </h1>
            <p className="text-sm text-muted-foreground">
              Presets you have voted for on the feed.
            </p>
          </div>
          <Empty className="border border-border">
            <EmptyMedia variant="icon">
              <Heart className="text-muted-foreground" />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>Sign in to see your votes</EmptyTitle>
              <EmptyDescription>
                Sign in to view presets you have voted for and manage your list.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <MyVotesSignInPrompt />
            </EmptyContent>
          </Empty>
        </main>
      </HomeLayout>
    )
  }

  const feedItems = await getVotedPresetsForUser(user.id)
  const items = feedItems.map((item) => ({
    code: item.code,
    baseColor: item.config.baseColor,
    iconLibrary: item.config.iconLibrary,
    font: item.config.font,
  }))

  return (
    <HomeLayout>
      <main className="grid gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            My votes
          </h1>
          <p className="text-sm text-muted-foreground">
            Presets you have voted for on the feed.
          </p>
        </div>
        {items.length === 0 ? (
          <Empty className="border border-border">
            <EmptyMedia variant="icon">
              <Heart className="text-muted-foreground" />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>No votes yet</EmptyTitle>
              <EmptyDescription>
                Explore the home feed and vote for presets you love—they will
                show up here.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ListView
            items={items}
            useLiveFeed={false}
            safePage={1}
            totalPages={1}
          />
        )}
      </main>
    </HomeLayout>
  )
}
