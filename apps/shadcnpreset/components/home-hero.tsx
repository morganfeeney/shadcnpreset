"use client"

import type { ReactNode } from "react"

import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/page-header"
import { Announcement } from "@/components/announcement"
import { siteConfig } from "@/lib/config"

type HomeHeroProps = {
  /** Search field; wrap `PresetForm` in `<Suspense>` in a Server Component parent. */
  children: ReactNode
}

export function HomeHero({ children }: HomeHeroProps) {
  return (
    <PageHeader>
      <Announcement />
      <PageHeaderHeading className="max-w-4xl">
        {siteConfig.title}
      </PageHeaderHeading>
      <PageHeaderDescription className="text-muted-foreground">
        <strong className="font-semibold">Don’t click random</strong>. Search
        the first community-voted library of shadcn presets by keyword, style,
        or vibe. Preview real components and build faster.{" "}
        <strong className="font-semibold">Open source and free</strong>.
      </PageHeaderDescription>
      <div className="w-full max-w-2xl">{children}</div>
    </PageHeader>
  )
}
