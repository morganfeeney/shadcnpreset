/** Matches `PresetForm` layout while `useSearchParams` resolves (server `Suspense` fallback). */
export function PresetFormSkeleton() {
  return (
    <div
      className="h-9 w-full max-w-2xl animate-pulse rounded-md border border-border bg-muted/30"
      aria-hidden
    />
  )
}
