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

type PresetPreviewTarget = {
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
      kind: "local",
      example: "preview",
    },
  },
  {
    page: "preview-02",
    label: "View 2",
    target: {
      kind: "local",
      example: "preview-02",
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
  "preview",
  "preview-02",
  "dashboard",
  "login-02",
  "login-04",
  "marketing",
  "application",
  "store",
  "chat",
  "generated",
  "builder",
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

export function presetBrowsePath(
  code: string,
  view: PresetPreviewPageName = "preview",
  /** Anything else the address holds, such as a draft, kept as it is. */
  query?: URLSearchParams
): string {
  const next = new URLSearchParams(query)
  if (view === "preview") next.delete("view")
  else next.set("view", view)
  const search = next.toString()
  return search ? `/preset/${code}?${search}` : `/preset/${code}`
}

export function isLocalPresetPreviewExample(
  value: string
): value is LocalPresetPreviewExample {
  return (LOCAL_PRESET_PREVIEW_EXAMPLES as readonly string[]).includes(value)
}
