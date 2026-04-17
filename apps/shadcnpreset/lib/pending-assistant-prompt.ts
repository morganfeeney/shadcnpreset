const PENDING_ASSISTANT_PROMPT_KEY = "shadcnpreset:pendingAssistantPrompt"
const MAX_PROMPT_LENGTH = 4000

export function writePendingAssistantPrompt(prompt: string) {
  if (typeof window === "undefined") {
    return
  }

  const normalized = prompt.trim()
  if (!normalized || normalized.length > MAX_PROMPT_LENGTH) {
    return
  }

  try {
    sessionStorage.setItem(PENDING_ASSISTANT_PROMPT_KEY, normalized)
  } catch {
    // ignore quota / private mode
  }
}

export function readPendingAssistantPrompt(): string | null {
  if (typeof window === "undefined") {
    return null
  }

  try {
    const raw = sessionStorage.getItem(PENDING_ASSISTANT_PROMPT_KEY)
    if (!raw || raw.length > MAX_PROMPT_LENGTH) {
      return null
    }
    return raw
  } catch {
    return null
  }
}

export function clearPendingAssistantPrompt() {
  if (typeof window === "undefined") {
    return
  }

  try {
    sessionStorage.removeItem(PENDING_ASSISTANT_PROMPT_KEY)
  } catch {
    // ignore
  }
}
