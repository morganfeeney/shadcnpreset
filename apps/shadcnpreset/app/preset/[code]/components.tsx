"use client"

import { PresetVoteButton } from "@/components/preset-vote-button"
import { Button } from "@/components/ui/button"
import { Share2 } from "lucide-react"

export function PresetButtons({ preset }: { preset: string }) {
  return (
    <>
      <PresetVoteButton code={preset} />
      <Button variant="outline">
        Share
        <Share2 aria-hidden />
      </Button>
    </>
  )
}
