export type PresetPreviewPageName =
  | "preview"
  | "preview-02"
  | "dashboard"
  | "login-02"
  | "login-04"

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
] as const

export function getPresetPreviewView(page: PresetPreviewPageName) {
  return PRESET_PREVIEW_VIEWS.find((item) => item.page === page) ?? null
}

export function isPresetPreviewPageName(
  value: string | undefined | null
): value is PresetPreviewPageName {
  return PRESET_PREVIEW_VIEWS.some((item) => item.page === value)
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

export function presetBrowsePath(
  code: string,
  view: PresetPreviewPageName = "preview",
  tab: PresetSidebarTab = "community"
): string {
  const params = new URLSearchParams()
  if (view !== "preview") params.set("view", view)
  if (tab !== "community") params.set("tab", tab)
  const query = params.toString()
  return query ? `/preset/${code}?${query}` : `/preset/${code}`
}

export function isLocalPresetPreviewExample(
  value: string
): value is LocalPresetPreviewExample {
  return (LOCAL_PRESET_PREVIEW_EXAMPLES as readonly string[]).includes(value)
}
