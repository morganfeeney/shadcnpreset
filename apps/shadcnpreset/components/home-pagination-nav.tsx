"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

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
  const router = useRouter()

  function navigate(href: string) {
    router.push(href)
  }

  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-baseline gap-4">
      {previousHref ? (
        <Button
          className="col-start-1"
          variant="secondary"
          onClick={() => navigate(previousHref)}
        >
          <ChevronLeft /> Previous
        </Button>
      ) : (
        <Button variant="secondary" disabled>
          <ChevronLeft /> Previous
        </Button>
      )}
      <span className="col-start-2 text-center text-sm">
        Page <code>{safePage.toLocaleString()}</code> of{" "}
        <code>{totalPages.toLocaleString()}</code>
      </span>
      {nextHref ? (
        <Button
          className="col-start-3"
          variant="secondary"
          onClick={() => navigate(nextHref)}
        >
          Next <ChevronRight />
        </Button>
      ) : (
        <Button variant="secondary" disabled>
          Next <ChevronRight />
        </Button>
      )}
    </div>
  )
}
