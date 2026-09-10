/**
 * The four canvas layouts a generated preview can be rendered in.
 *
 * Different kinds of output want genuinely different markup — a lone form and
 * a set of twenty buttons cannot share a container without one of them looking
 * wrong.
 */
export const PREVIEW_LAYOUTS = ["single", "gallery", "page", "stack"] as const

export type PreviewLayout = (typeof PREVIEW_LAYOUTS)[number]

/** Components whose presence means the preview is a whole screen. */
const PAGE_COMPONENTS = /<\s*(SidebarProvider|Sidebar|SidebarInset)\b/

/** Root sized to the viewport is also a whole screen. */
const PAGE_SIZING = /className="[^"]*\b(min-h-screen|h-screen|min-h-svh|h-svh)\b/

/** How many repeated siblings before a set reads as a gallery rather than a row. */
const GALLERY_THRESHOLD = 4

/** Strips the `PreviewFrame` wrapper so the real root is what gets inspected. */
function unwrapFrame(code: string): string {
  const open = code.search(/<\s*PreviewFrame\b/)
  if (open === -1) return code
  const start = code.indexOf(">", open)
  const close = code.lastIndexOf("</PreviewFrame>")
  if (start === -1 || close === -1 || close < start) return code
  return code.slice(start + 1, close)
}

/** Counts the most-repeated component name among JSX elements. */
function largestRepeatedGroup(code: string): number {
  const counts = new Map<string, number>()
  for (const match of code.matchAll(/<\s*([A-Z][\w$]*)/g)) {
    const name = match[1]!
    counts.set(name, (counts.get(name) ?? 0) + 1)
  }
  return Math.max(0, ...counts.values())
}

/**
 * Picks the canvas layout from the code the model returned.
 *
 * Deliberately derived from the output rather than chosen by the model: asking
 * it to pick — through a class, a prop, or a prompt rule — produced a different
 * answer run to run for the same request. Reading the shape of what came back
 * gives the same layout for the same output, every time.
 *
 * The outermost structure decides, so a card that happens to contain a button
 * row is still a single component.
 */
export function inferPreviewLayout(code: string): PreviewLayout {
  const body = unwrapFrame(code)

  if (PAGE_COMPONENTS.test(body) || PAGE_SIZING.test(body)) {
    return "page"
  }

  // Either the same component written out many times, or a `.map` rendering a
  // list — a map writes its component once in the source but yields many.
  const repeated = largestRepeatedGroup(body)
  const rendersList = /\.map\s*\(/.test(body) && /<\s*[A-Z]/.test(body)

  if (repeated >= GALLERY_THRESHOLD || rendersList) {
    return /\bflex-col\b/.test(body) ? "stack" : "gallery"
  }

  if (/\bflex-col\b/.test(body) && repeated >= 2) {
    return "stack"
  }

  return "single"
}
