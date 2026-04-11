import { Skeleton } from "@/components/ui/skeleton"
import { CardListSkeleton } from "@/components/card-list-skeleton"

/** Neutral shell for `app/loading.tsx` — must not mirror the homepage hero. */
export function AppRouteLoading() {
  return (
    <>
      <div className="grid gap-6 pt-16">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-48 max-w-md" />
          <Skeleton className="h-5 w-full max-w-lg" />
        </div>
        <CardListSkeleton />
      </div>
    </>
  )
}
