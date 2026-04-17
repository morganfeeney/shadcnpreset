"use client"

import { buttonVariants } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function HomeHeroButtons() {
  return (
    <div className="flex gap-2">
      <Link href="/assistant" className={buttonVariants({ size: "lg" })}>
        Ask AI <ArrowRight />
      </Link>
      <Link
        href="/community"
        className={buttonVariants({ variant: "secondary", size: "lg" })}
      >
        Browse Community
      </Link>
    </div>
  )
}
