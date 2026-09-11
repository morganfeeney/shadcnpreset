/**
 * Synced from the shadcn/ui fork by `pnpm sync:cn-ui` — do not edit by hand.
 * Source: apps/v4/registry/bases/base/ui/spinner.tsx
 */
import { cn } from "@/lib/utils"

import { IconPlaceholder } from "@/components/icon-placeholder"

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <IconPlaceholder
      lucide="Loader2Icon"
      tabler="IconLoader"
      hugeicons="Loading03Icon"
      phosphor="SpinnerIcon"
      remixicon="RiLoaderLine"
      data-slot="spinner"
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  )
}

export { Spinner }
