"use client"

import { PresetForm } from "@/components/preset-form"
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/page-header"
import { Announcement } from "@/components/announcement"

export function HomeHero() {
  return (
    <PageHeader>
      <Announcement />
      <PageHeaderHeading className="max-w-4xl">
        Discover and apply great shadcn presets in seconds
      </PageHeaderHeading>
      <PageHeaderDescription>
        Search by exact preset code or use smart search for diverse results,
        then preview real component behavior and vote from the feed.
      </PageHeaderDescription>
      <div className="w-full max-w-2xl">
        <PresetForm className="pt-2" />
      </div>
    </PageHeader>
  )
}
