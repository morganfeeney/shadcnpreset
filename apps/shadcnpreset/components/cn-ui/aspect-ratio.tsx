/**
 * Synced from the shadcn/ui fork by `pnpm sync:cn-ui` — do not edit by hand.
 * Source: apps/v4/registry/bases/base/ui/aspect-ratio.tsx
 */
import { cn } from "@/lib/utils"

function AspectRatio({
  ratio,
  className,
  ...props
}: React.ComponentProps<"div"> & { ratio: number }) {
  return (
    <div
      data-slot="aspect-ratio"
      style={
        {
          "--ratio": ratio,
        } as React.CSSProperties
      }
      className={cn("relative aspect-(--ratio)", className)}
      {...props}
    />
  )
}

export { AspectRatio }
