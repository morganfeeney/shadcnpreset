import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"

export function Announcement() {
  return (
    <Badge
      render={
        <Link href="/docs/changelog/2026-03-cli-v4">
          shadcn/skills, presets and more <ArrowRightIcon />
        </Link>
      }
      variant="secondary"
      className="bg-muted"
    ></Badge>
  )
}
