import { PropsWithChildren } from "react"
import type { Metadata } from "next"

import { Toaster } from "@/components/ui/sonner"
import { WideLayoutNoFooter } from "@/components/wide-layout-no-footer"

export const metadata: Metadata = {
  title: "AI powered shadcn preset finder",
  description:
    "Guided conversation that turns your description into facet choices and live preset previews.",
}

export default function PresetLayout({ children }: PropsWithChildren) {
  return (
    <WideLayoutNoFooter>
      {children}
      <Toaster />
    </WideLayoutNoFooter>
  )
}
