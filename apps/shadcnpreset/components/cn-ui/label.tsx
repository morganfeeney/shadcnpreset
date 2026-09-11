/**
 * Synced from the shadcn/ui fork by `pnpm sync:cn-ui` — do not edit by hand.
 * Source: apps/v4/registry/bases/base/ui/label.tsx
 */
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn(
        "cn-label flex items-center select-none group-data-[disabled=true]:pointer-events-none peer-disabled:cursor-not-allowed",
        className
      )}
      {...props}
    />
  )
}

export { Label }
