import { PropsWithChildren } from "react"

import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/page-header"

export default function PresetThemeLayout({ children }: PropsWithChildren) {
  return (
    <>
      <PageHeader>
        <PageHeaderHeading className="max-w-4xl">
          Preset Theme CSS Extractor
        </PageHeaderHeading>
        <PageHeaderDescription className="text-muted-foreground">
          Decode a shadcn preset code, preview it, and generate copy-pasteable
          CSS custom properties for light and dark mode.
        </PageHeaderDescription>
      </PageHeader>
      {children}
    </>
  )
}
