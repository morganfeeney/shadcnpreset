import * as React from "react"

import { cn } from "@/lib/utils"

function UIShowcase({
  children,
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="ui-showcase"
      className={cn(
        "aspect-auto size-fit overflow-hidden rounded-xl border bg-muted",
        "has-data-[slot=ui-showcase-inset]:p-1",
        className
      )}
      {...props}
    >
      <div
        data-slot="ui-showcase-inset"
        className={cn(
          "relative aspect-auto size-fit overflow-hidden rounded-lg border-2 bg-background",
          "[&_img:not([class*='aspect-'])]:aspect-auto [&_img:not([class*='object-'])]:object-cover [&_img:not([class*='size-'])]:size-full"
        )}
      >
        {children}
      </div>
    </div>
  )
}

export { UIShowcase }
