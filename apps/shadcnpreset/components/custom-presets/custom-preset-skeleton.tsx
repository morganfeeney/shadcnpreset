import { Skeleton } from "@/components/ui/skeleton"

/**
 * The editor while a custom preset is read, shaped like it: the preview on
 * its canvas and the properties column beside it, so nothing jumps.
 */
export function CustomPresetBodySkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading custom preset"
      className="flex min-h-0 flex-1 flex-col lg:flex-row"
    >
      <div className="h-[70svh] shrink-0 bg-muted p-3 lg:h-auto lg:flex-1 lg:p-5">
        <Skeleton className="size-full rounded-lg bg-background" />
      </div>
      <div className="grid shrink-0 content-start gap-2.5 border-t p-4 lg:w-72 lg:border-t-0 lg:border-l">
        <Skeleton className="h-3 w-16" />
        {Array.from({ length: 9 }, (_, i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-7 flex-1" />
          </div>
        ))}
      </div>
    </div>
  )
}
