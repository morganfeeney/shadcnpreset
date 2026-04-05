import { Skeleton } from "@/components/ui/skeleton"

/** Neutral shell for `app/loading.tsx` — must not mirror the homepage hero. */
export function AppRouteLoading() {
  return (
    <>
      <div className="grid gap-6 pt-16">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-48 max-w-md" />
          <Skeleton className="h-5 w-full max-w-lg" />
        </div>
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <li key={i}>
              <Skeleton
                className="w-full rounded-lg"
                style={{ aspectRatio: "700 / 575" }}
              />
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
