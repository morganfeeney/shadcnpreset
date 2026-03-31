import { Announcement } from "@/components/announcement"
import { HomeResultsSkeleton } from "@/components/home-results-skeleton"
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/page-header"
import { Skeleton } from "@/components/ui/skeleton"
import { HomeLayout } from "@/components/home-layout"

export function HomeLoadingState() {
  return (
    <HomeLayout>
      <PageHeader>
        <Announcement />
        <PageHeaderHeading className="max-w-4xl">
          Find and compare the best shadcn presets in seconds
        </PageHeaderHeading>
        <PageHeaderDescription>
          Search by exact preset code or use smart search for diverse results,
          then preview real component behavior and vote from the feed.
        </PageHeaderDescription>
        <div className="w-full max-w-2xl space-y-2.5 pt-2">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Skeleton className="h-9 w-full sm:w-36" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full sm:w-24" />
          </div>
        </div>
      </PageHeader>

      <HomeResultsSkeleton />
    </HomeLayout>
  )
}
