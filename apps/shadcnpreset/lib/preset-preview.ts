export type PresetPreviewPageName =
  | "preview"
  | "preview-02"
  | "dashboard"
  | "login-02"
  | "login-04"
  | "generated"

export type PresetSidebarTab = "community" | "yours" | "ask-ai"

type PresetPreviewTarget =
  | {
      kind: "v4"
      pageName: "preview" | "preview-02"
    }
  | {
      kind: "local"
      example: LocalPresetPreviewExample
    }

export const PRESET_PREVIEW_VIEWS: ReadonlyArray<{
  page: PresetPreviewPageName
  label: string
  target: PresetPreviewTarget
}> = [
  {
    page: "preview",
    label: "View 1",
    target: {
      kind: "v4",
      pageName: "preview",
    },
  },
  {
    page: "preview-02",
    label: "View 2",
    target: {
      kind: "v4",
      pageName: "preview-02",
    },
  },
  {
    page: "dashboard",
    label: "Dashboard",
    target: {
      kind: "local",
      example: "dashboard",
    },
  },
  {
    page: "login-02",
    label: "Login 02",
    target: {
      kind: "local",
      example: "login-02",
    },
  },
  {
    page: "login-04",
    label: "Login 04",
    target: {
      kind: "local",
      example: "login-04",
    },
  },
] as const

export type LocalPresetPreviewExample =
  (typeof LOCAL_PRESET_PREVIEW_EXAMPLES)[number]

export const LOCAL_PRESET_PREVIEW_EXAMPLES = [
  "dashboard",
  "login-02",
  "login-04",
  "generated",
] as const

/**
 * Ad-hoc Ask AI preview. Deliberately absent from `PRESET_PREVIEW_VIEWS`: it is
 * only reachable once the assistant has generated something, so it never shows
 * up in the default view picker.
 */
export const GENERATED_PREVIEW_VIEW: {
  page: PresetPreviewPageName
  label: string
  target: PresetPreviewTarget
} = {
  page: "generated",
  label: "Generated",
  target: {
    kind: "local",
    example: "generated",
  },
}

export function getPresetPreviewView(page: PresetPreviewPageName) {
  if (page === "generated") return GENERATED_PREVIEW_VIEW
  return PRESET_PREVIEW_VIEWS.find((item) => item.page === page) ?? null
}

export function isPresetPreviewPageName(
  value: string | undefined | null
): value is PresetPreviewPageName {
  return (
    value === GENERATED_PREVIEW_VIEW.page ||
    PRESET_PREVIEW_VIEWS.some((item) => item.page === value)
  )
}

export function parsePresetPreviewPageName(
  value: string | undefined | null
): PresetPreviewPageName {
  return isPresetPreviewPageName(value) ? value : "preview"
}

export function isPresetSidebarTab(
  value: string | undefined | null
): value is PresetSidebarTab {
  return value === "community" || value === "yours" || value === "ask-ai"
}

export function parsePresetSidebarTab(
  value: string | undefined | null
): PresetSidebarTab {
  return isPresetSidebarTab(value) ? value : "community"
}

export const PRESET_CHAT_PARAM = "chat"

export function presetBrowsePath(
  code: string,
  view: PresetPreviewPageName = "preview",
  tab: PresetSidebarTab = "community",
  /** Assistant chat to open in the sidebar, e.g. when linking from /assistant. */
  chatId?: string
): string {
  const params = new URLSearchParams()
  if (view !== "preview") params.set("view", view)
  if (tab !== "community") params.set("tab", tab)
  if (chatId) params.set(PRESET_CHAT_PARAM, chatId)
  const query = params.toString()
  return query ? `/preset/${code}?${query}` : `/preset/${code}`
}

export function isLocalPresetPreviewExample(
  value: string
): value is LocalPresetPreviewExample {
  return (LOCAL_PRESET_PREVIEW_EXAMPLES as readonly string[]).includes(value)
}
