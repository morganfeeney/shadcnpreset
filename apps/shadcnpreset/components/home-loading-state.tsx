import { Announcement } from "@/components/announcement"
import { HomeResultsSkeleton } from "@/components/home-results-skeleton"
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/page-header"
import { Skeleton } from "@/components/ui/skeleton"
import { ListLayout } from "@/components/list-layout"
import { siteConfig } from "@/lib/config"

export function HomeLoadingState() {
  return (
    <ListLayout>
      <PageHeader>
        <Announcement />
        <PageHeaderHeading className="max-w-4xl">
          {siteConfig.title}
        </PageHeaderHeading>
        <PageHeaderDescription className="text-muted-foreground">
          {siteConfig.description}
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
    </ListLayout>
  )
}
