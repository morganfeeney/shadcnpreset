/** Query param carrying vote intent across OAuth (full page reload). */
export const PENDING_VOTE_SEARCH_PARAM = "pendingVote"

export function writePendingVote(presetCode: string) {
  if (typeof window === "undefined") {
    return
  }
  const url = new URL(window.location.href)
  url.searchParams.set(PENDING_VOTE_SEARCH_PARAM, presetCode)
  window.history.replaceState(window.history.state, "", url.toString())
}

export function readPendingVoteCode(): string | null {
  if (typeof window === "undefined") {
    return null
  }
  const raw = new URL(window.location.href).searchParams.get(
    PENDING_VOTE_SEARCH_PARAM
  )
  if (!raw || raw.length > 256) {
    return null
  }
  return raw
}

export function clearPendingVote() {
  if (typeof window === "undefined") {
    return
  }
  const url = new URL(window.location.href)
  if (!url.searchParams.has(PENDING_VOTE_SEARCH_PARAM)) {
    return
  }
  url.searchParams.delete(PENDING_VOTE_SEARCH_PARAM)
  window.history.replaceState(window.history.state, "", url.toString())
}
