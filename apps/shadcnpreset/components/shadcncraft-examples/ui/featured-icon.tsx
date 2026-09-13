import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

export const featuredIconVariants = cva(
  "flex shrink-0 items-center justify-center border bg-muted [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='text-'])]:text-primary",
  {
    variants: {
      size: {
        sm: "size-8 rounded-md [&_svg]:size-3",
        md: "size-12 rounded-lg [&_svg]:size-4",
        lg: "size-16 rounded-xl [&_svg]:size-6",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

export function FeaturedIcon({
  size = "md",
  className,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof featuredIconVariants>) {
  return (
    <div
      data-slot="featured-icon"
      className={cn(featuredIconVariants({ size }), className)}
      {...props}
    />
  )
}
