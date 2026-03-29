import { Card, CardFooter } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

function CardSkeleton() {
  return (
    <li>
      <Card className="gap-0 pt-0">
        <div
          className="relative w-full overflow-hidden"
          style={{ aspectRatio: "700 / 575" }}
        >
          <Skeleton className="absolute inset-0 rounded-none" />
        </div>
        <CardFooter className="justify-between">
          <div className="min-w-0 space-y-1.5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-44" />
          </div>
          <Skeleton className="h-8 w-14" />
        </CardFooter>
      </Card>
    </li>
  )
}

export function HomeResultsSkeleton() {
  return (
    <main className="grid gap-4">
      <div className="grid grid-cols-[auto_1fr_auto] gap-4">
        <Button disabled className="invisible">
          <ChevronLeft /> Previous
        </Button>
        <span>
          <Skeleton className="inline-block h-4 w-44 align-middle" />
        </span>
        <Button disabled className="invisible">
          Next <ChevronRight />
        </Button>
      </div>

      <section className="space-y-4">
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3">
          {Array.from({ length: 12 }, (_, index) => (
            <CardSkeleton key={`preset-skeleton-${index}`} />
          ))}
        </ul>
      </section>
    </main>
  )
}
