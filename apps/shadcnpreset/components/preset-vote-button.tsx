"use client"

import { Heart } from "lucide-react"

import { Button } from "@/components/ui/button"
import useVote from "@/hooks/use-vote"
import { cn } from "@/lib/utils"

type PresetVoteButtonProps = {
  code: string
  /** When false, skips vote query (e.g. closed dialogs). */
  enabled?: boolean
}

export function PresetVoteButton({
  code,
  enabled = true,
}: PresetVoteButtonProps) {
  const { toggleVote, voteCount, isVoting, hasVoted, authStatus } = useVote(
    code,
    { enabled }
  )

  return (
    <Button
      type="button"
      onClick={toggleVote}
      disabled={isVoting}
      aria-pressed={hasVoted}
      variant="outline"
      title={
        authStatus === "authenticated"
          ? "Vote for this preset"
          : "Sign in to vote"
      }
    >
      <Heart
        className={cn(
          hasVoted ? "fill-rose-500 text-rose-500" : "text-muted-foreground"
        )}
      />
      <span>{voteCount}</span>
    </Button>
  )
}
