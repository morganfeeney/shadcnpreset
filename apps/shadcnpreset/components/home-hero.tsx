"use client"

import { PresetForm } from "@/components/preset-form"
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/page-header"
import { Announcement } from "@/components/announcement"
import { siteConfig } from "@/lib/config"

export function HomeHero() {
  return (
    <PageHeader>
      <Announcement />
      <PageHeaderHeading className="max-w-4xl">
        {siteConfig.title}
      </PageHeaderHeading>
      <PageHeaderDescription>{siteConfig.description}</PageHeaderDescription>
      <div className="w-full max-w-2xl">
        <PresetForm className="pt-2" />
      </div>
    </PageHeader>
  )
}
