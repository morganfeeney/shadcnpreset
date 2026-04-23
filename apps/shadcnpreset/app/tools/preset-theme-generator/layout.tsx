import { PropsWithChildren } from "react"

import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/page-header"
import { PRESET_THEME_GENERATOR_TOOL } from "@/app/tools/tools"

export default function PresetThemeGeneratorLayout({
  children,
}: PropsWithChildren) {
  return (
    <>
      <PageHeader>
        <PageHeaderHeading className="max-w-4xl">
          {PRESET_THEME_GENERATOR_TOOL.title}
        </PageHeaderHeading>
        <PageHeaderDescription className="text-muted-foreground">
          {PRESET_THEME_GENERATOR_TOOL.description}
        </PageHeaderDescription>
      </PageHeader>
      {children}
    </>
  )
}
