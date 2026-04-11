/** sessionStorage key: vote intent across OAuth (full page reload), not tied to the URL. */
const PENDING_VOTE_STORAGE_KEY = "shadcnpreset:pendingVote"

export function writePendingVote(presetCode: string) {
  if (typeof window === "undefined") {
    return
  }
  try {
    sessionStorage.setItem(PENDING_VOTE_STORAGE_KEY, presetCode)
  } catch {
    // ignore quota / private mode
  }
}

export function readPendingVoteCode(): string | null {
  if (typeof window === "undefined") {
    return null
  }
  try {
    const raw = sessionStorage.getItem(PENDING_VOTE_STORAGE_KEY)
    if (!raw || raw.length > 256) {
      return null
    }
    return raw
  } catch {
    return null
  }
}

export function clearPendingVote() {
  if (typeof window === "undefined") {
    return
  }
  try {
    sessionStorage.removeItem(PENDING_VOTE_STORAGE_KEY)
  } catch {
    // ignore
  }
}
