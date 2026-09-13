import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"
import { IconPlaceholder } from "@/components/icon-placeholder"

export function PlaceholderLogo({
  className,
  onlyIcon = false,
  ...props
}: ComponentProps<"svg"> & { onlyIcon?: boolean }) {
  const icon = (
    <IconPlaceholder
      lucide="Bolt"
      tabler="IconBolt"
      hugeicons="ZapIcon"
      phosphor="LightningIcon"
      remixicon="RiSpeedLine"
      className={cn("size-6 shrink-0 text-primary", className)}
      {...props}
    />
  )

  if (onlyIcon) {
    return icon
  }

  return (
    <div className="flex shrink-0 items-center gap-1">
      {icon}
      <span className="text-sm font-medium text-nowrap text-primary">
        Acme Inc.
      </span>
    </div>
  )
}
