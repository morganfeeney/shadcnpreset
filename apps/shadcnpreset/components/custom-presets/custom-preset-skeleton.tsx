import { Skeleton } from "@/components/ui/skeleton"

/**
 * The custom preset page while it is read, shaped like it — title, the eight
 * pickers, overrides, preview, install — so it fills the page instead of the
 * footer, and nothing jumps when the page arrives.
 */
export function CustomPresetSkeleton() {
  return (
    <main
      className="min-w-0 flex-1 pt-6 px-safe pb-20 lg:px-10"
      role="status"
      aria-label="Loading custom preset"
    >
      <div className="mx-auto grid max-w-6xl gap-12">
        <div className="grid max-w-3xl gap-4">
          <Skeleton className="h-10 w-80 max-w-full" />
          <div className="grid gap-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>

        <div className="grid gap-6">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="grid gap-1.5">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-9 w-full" />
              </div>
            ))}
          </div>
          <div className="grid gap-2">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-8 w-40" />
          </div>
        </div>

        <Skeleton className="min-h-[40rem] rounded-2xl" />

        <div className="grid gap-4">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
        </div>
      </div>
    </main>
  )
}
