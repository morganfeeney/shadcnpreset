import { PropsWithChildren, Suspense } from "react"

import { CustomPresetSkeleton } from "@/components/custom-presets/custom-preset-skeleton"
import { Toaster } from "@/components/ui/sonner"
import { WideLayoutNoFooter } from "@/components/wide-layout-no-footer"

/**
 * A custom preset fills the window under the header, like the assistant. It
 * is read per request, so its page renders inside Suspense, shown as a
 * skeleton of itself until it arrives.
 */
export default function Layout({ children }: PropsWithChildren) {
  return (
    <WideLayoutNoFooter>
      <Suspense fallback={<CustomPresetSkeleton />}>{children}</Suspense>
      <Toaster />
    </WideLayoutNoFooter>
  )
}
