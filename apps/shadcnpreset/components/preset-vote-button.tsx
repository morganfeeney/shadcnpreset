"use client"

import { Heart } from "lucide-react"

import { Button } from "@/components/ui/button"
import useVote from "@/hooks/use-vote"

type PresetVoteButtonProps = {
  code: string
}

export function PresetVoteButton({ code }: PresetVoteButtonProps) {
  const { toggleVote, voteCount, isVoting, hasVoted, authStatus } = useVote(code)

  return (
    <Button
      type="button"
      onClick={toggleVote}
      disabled={isVoting}
      aria-pressed={hasVoted}
      variant="outline"
      title={authStatus === "authenticated" ? "Vote for this preset" : "Sign in to vote"}
      className="inline-flex items-center gap-2"
    >
      <Heart
        className={`size-4 ${
          hasVoted ? "fill-rose-500 text-rose-500" : "text-muted-foreground"
        }`}
      />
      <span>{voteCount}</span>
    </Button>
  )
}
