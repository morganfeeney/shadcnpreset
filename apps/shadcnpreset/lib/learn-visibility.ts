export const LEARN_STATUSES = ["draft", "published"] as const

export type LearnStatus = (typeof LEARN_STATUSES)[number]

type LearnVisibilityEnv = {
  NODE_ENV?: string
  SHOW_LEARN_DRAFTS?: string
}

function parseDraftFlag(value: string | undefined): boolean | undefined {
  if (value === "1" || value === "true") {
    return true
  }
  if (value === "0" || value === "false") {
    return false
  }
  return undefined
}

/** Drafts show in `next dev`. Production builds hide them unless SHOW_LEARN_DRAFTS is on. */
export function showLearnDrafts(env: LearnVisibilityEnv = process.env): boolean {
  const flag = parseDraftFlag(env.SHOW_LEARN_DRAFTS)
  if (flag !== undefined) {
    return flag
  }
  return env.NODE_ENV !== "production"
}

export function isLearnArticleVisible(
  status: LearnStatus,
  env: LearnVisibilityEnv = process.env
): boolean {
  return status === "published" || showLearnDrafts(env)
}
