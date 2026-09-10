/**
 * Synced from the shadcn/ui fork by `pnpm sync:cn-ui` — do not edit by hand.
 * Source: apps/v4/registry/bases/base/ui/skeleton.tsx
 */
import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("cn-skeleton animate-pulse", className)}
      {...props}
    />
  )
}

export { Skeleton }
