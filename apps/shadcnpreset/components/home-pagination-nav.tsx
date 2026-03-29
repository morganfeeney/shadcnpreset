"use client"

import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type HomePaginationNavProps = {
  previousHref?: string
  nextHref?: string
  safePage: number
  totalPages: number
}

export function HomePaginationNav({
  previousHref,
  nextHref,
  safePage,
  totalPages,
}: HomePaginationNavProps) {
  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-baseline gap-4">
      {previousHref ? (
        <Link
          href={previousHref}
          prefetch={false}
          className={cn("col-start-1", buttonVariants({ variant: "secondary" }))}
        >
          <ChevronLeft /> Previous
        </Link>
      ) : (
        <span
          className={cn(
            buttonVariants({ variant: "secondary" }),
            "pointer-events-none opacity-50"
          )}
          aria-disabled="true"
        >
          <ChevronLeft /> Previous
        </span>
      )}
      <span className="col-start-2 text-center text-sm">
        Page <code>{safePage.toLocaleString()}</code> of{" "}
        <code>{totalPages.toLocaleString()}</code>
      </span>
      {nextHref ? (
        <Link
          href={nextHref}
          prefetch={false}
          className={cn("col-start-3", buttonVariants({ variant: "secondary" }))}
        >
          Next <ChevronRight />
        </Link>
      ) : (
        <span
          className={cn(
            buttonVariants({ variant: "secondary" }),
            "pointer-events-none opacity-50"
          )}
          aria-disabled="true"
        >
          Next <ChevronRight />
        </span>
      )}
    </div>
  )
}
