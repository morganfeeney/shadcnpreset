"use client"

import { PresetForm } from "@/components/preset-form"
import { PageHeader, PageHeaderDescription, PageHeaderHeading } from "@/components/page-header"
import { Announcement } from "@/components/announcement"

export function HomeHero() {
  return (
    <PageHeader>
      <Announcement />
      <PageHeaderHeading className="max-w-4xl">
        Discover and apply great shadcn presets in seconds
      </PageHeaderHeading>
      <PageHeaderDescription>
        Search generated presets, preview real component behavior, and jump
        straight into create with the preset prefilled.
      </PageHeaderDescription>
      <div className="w-full max-w-2xl">
        <PresetForm />
      </div>
    </PageHeader>
  )
}
