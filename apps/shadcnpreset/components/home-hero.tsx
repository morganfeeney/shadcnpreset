"use client"

import Link from "next/link"
import { PresetForm } from "@/components/preset-form"
import { buttonVariants } from "@/components/ui/button"
import { PageHeader, PageHeaderDescription, PageHeaderHeading, PageActions } from "@/components/page-header"
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

      <PageActions>
        <Link
          className={buttonVariants({
            size: "sm",
            className: "h-[31px] rounded-lg",
          })}
          href="#browse"
        >
          Browse presets
        </Link>
        <Link
          className={buttonVariants({
            size: "sm",
            variant: "ghost",
            className: "rounded-lg",
          })}
          href="http://localhost:4000/create"
        >
          Open shadcn create
        </Link>
      </PageActions>
    </PageHeader>
  )
}
