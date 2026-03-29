"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
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
  const [isPending, startTransition] = useTransition()

  function navigate(href: string) {
    startTransition(() => {
      router.push(href)
    })
  }

  return (
    <div className="grid grid-cols-[auto_1fr_auto] gap-4">
      {previousHref ? (
        <Button
          className="col-start-1"
          variant="secondary"
          disabled={isPending}
          onClick={() => navigate(previousHref)}
        >
          <ChevronLeft /> Previous
        </Button>
      ) : (
        <Button disabled className="invisible">
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
          disabled={isPending}
          onClick={() => navigate(nextHref)}
        >
          Next <ChevronRight />
        </Button>
      ) : (
        <Button disabled className="invisible">
          Next <ChevronRight />
        </Button>
      )}
    </div>
  )
}
