import { PropsWithChildren, Suspense } from "react"

import { CustomPresetSkeleton } from "@/components/custom-presets/custom-preset-skeleton"
import { WideLayout } from "@/components/wide-layout"

/**
 * A custom preset is read per request, so its page renders inside Suspense,
 * shown as a skeleton of itself until it arrives.
 */
export default function Layout({ children }: PropsWithChildren) {
  return (
    <WideLayout>
      <Suspense fallback={<CustomPresetSkeleton />}>{children}</Suspense>
    </WideLayout>
  )
}
