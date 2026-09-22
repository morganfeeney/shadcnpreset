import type { Metadata } from "next"

import { DescribePreset } from "@/components/describe/describe-preset"
import { WideLayout } from "@/components/wide-layout"
import { buildPageMetadata } from "@/lib/page-metadata"

const DESCRIBE_TITLE = "Describe a preset with Jev"
const DESCRIBE_DESCRIPTION =
  "Describe the look you want and Jev builds a shadcn preset as you type — colours, fonts, icons, corners and shell."

export const metadata: Metadata = buildPageMetadata({
  title: DESCRIBE_TITLE,
  description: DESCRIBE_DESCRIPTION,
  path: "/describe",
})

/** Same shell as /preset: wide layout, hero, sidebar and preview pane. */
export default function DescribePage() {
  return (
    <WideLayout>
      <DescribePreset />
    </WideLayout>
  )
}
