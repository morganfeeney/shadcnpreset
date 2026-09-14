export type PresetPreviewPageName =
  | "preview"
  | "preview-02"
  | "dashboard"
  | "login-02"
  | "login-04"
  | "marketing"
  | "application"
  | "store"
  | "chat"
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

/** Affiliate credit shown above a view built from a partner's blocks. */
export type PresetPreviewCredit = {
  label: string
  /** Placement, sent as the link's `src` param and to analytics. */
  source: string
}

type PresetPreviewView = {
  page: PresetPreviewPageName
  label: string
  target: PresetPreviewTarget
  credit?: PresetPreviewCredit
}

export const PRESET_PREVIEW_VIEWS: ReadonlyArray<PresetPreviewView> = [
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
  {
    page: "marketing",
    label: "Marketing",
    target: {
      kind: "local",
      example: "marketing",
    },
    credit: { label: "Marketing blocks", source: "marketing-preview" },
  },
  {
    page: "application",
    label: "Application",
    target: {
      kind: "local",
      example: "application",
    },
    credit: { label: "Application blocks", source: "application-preview" },
  },
  {
    page: "store",
    label: "Store",
    target: {
      kind: "local",
      example: "store",
    },
    credit: { label: "E-commerce blocks", source: "store-preview" },
  },
  {
    page: "chat",
    label: "Chat",
    target: {
      kind: "local",
      example: "chat",
    },
    credit: { label: "AI chat blocks", source: "chat-preview" },
  },
] as const

export type LocalPresetPreviewExample =
  (typeof LOCAL_PRESET_PREVIEW_EXAMPLES)[number]

export const LOCAL_PRESET_PREVIEW_EXAMPLES = [
  "dashboard",
  "login-02",
  "login-04",
  "marketing",
  "application",
  "store",
  "chat",
  "generated",
] as const

/**
 * Ad-hoc Ask AI preview. Deliberately absent from `PRESET_PREVIEW_VIEWS`: it is
 * only reachable once the assistant has generated something, so it never shows
 * up in the default view picker.
 */
export const GENERATED_PREVIEW_VIEW: PresetPreviewView = {
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
