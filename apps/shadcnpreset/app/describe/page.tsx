import type { Metadata } from "next"

import { DescribePreset } from "@/components/describe/describe-preset"
import { WideLayout } from "@/components/wide-layout"

export const metadata: Metadata = {
  title: "Describe a preset",
  description: "Describe a look and watch the preset build as you type.",
  // Experimental: keep it out of search until it has settled.
  robots: { index: false, follow: false },
}

/** Same shell as /preset: wide layout, hero, sidebar and preview pane. */
export default function DescribePage() {
  return (
    <WideLayout>
      <DescribePreset />
    </WideLayout>
  )
}
