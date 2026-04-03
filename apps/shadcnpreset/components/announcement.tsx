import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"

export function Announcement() {
  return (
    <Badge
      render={
        <Link href="">
          Read the announcement <ArrowRightIcon />
        </Link>
      }
      variant="secondary"
      className="bg-muted"
    ></Badge>
  )
}
