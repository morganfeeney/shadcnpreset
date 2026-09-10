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

type RootScan = {
  /** Component names appearing as direct children of the root element. */
  childNames: string[]
  /** Whether a `.map(` sits directly inside the root rather than nested deeper. */
  mapsAtRoot: boolean
}

/**
 * Walks the JSX far enough to see the root element's direct children.
 *
 * Depth matters: a sign-up form repeats `Field` four times, but those live
 * inside a Card, so the preview is still one component. Counting repeats across
 * the whole tree classified it as a gallery and squeezed it into a column.
 */
function scanRoot(body: string): RootScan {
  const tag = /<\s*(\/)?\s*([A-Za-z][\w$.]*)([^>]*?)(\/)?>/g
  const childNames: string[] = []
  let depth = -1
  let rootStart = -1
  let rootEnd = body.length
  let match: RegExpExecArray | null

  while ((match = tag.exec(body))) {
    const [full, closing, name, , selfClosing] = match
    const isSelfClosing = Boolean(selfClosing) || full.endsWith("/>")

    if (closing) {
      depth -= 1
      if (depth < 0) {
        rootEnd = match.index
        break
      }
      continue
    }

    depth += 1
    // depth 0 is the root; its direct children are depth 1.
    if (depth === 1 && /^[A-Z]/.test(name!)) {
      childNames.push(name!)
    }
    if (depth === 0) {
      rootStart = tag.lastIndex
    }
    if (isSelfClosing) {
      depth -= 1
      if (depth < 0) break
    }
  }

  // A `.map` nested inside a child (a table's rows, say) does not make the
  // preview a gallery; one sitting directly in the root does.
  const inner = rootStart === -1 ? body : body.slice(rootStart, rootEnd)
  const nested = inner.replace(/<\s*([A-Z][\w$.]*)[\s\S]*?<\/\s*\1\s*>/g, "")
  const mapsAtRoot = /\.map\s*\(/.test(nested)

  return { childNames, mapsAtRoot }
}

/** How many times the most-repeated name appears. */
function largestRepeat(names: string[]): number {
  const counts = new Map<string, number>()
  for (const name of names) counts.set(name, (counts.get(name) ?? 0) + 1)
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

  // Only the root's direct children count: repeats deeper down are the internals
  // of one component, not a set of many.
  const { childNames, mapsAtRoot } = scanRoot(body)
  const repeated = largestRepeat(childNames)
  const rendersList = mapsAtRoot && childNames.length > 0

  if (repeated >= GALLERY_THRESHOLD || rendersList) {
    return /\bflex-col\b/.test(body) ? "stack" : "gallery"
  }

  if (/\bflex-col\b/.test(body) && repeated >= 2) {
    return "stack"
  }

  return "single"
}
