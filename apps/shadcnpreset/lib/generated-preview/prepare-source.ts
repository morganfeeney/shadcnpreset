const FENCE_RE = /^```(?:tsx|jsx|ts|js|javascript|typescript)?\s*\n?([\s\S]*?)\n?```$/
const IMPORT_RE = /^\s*import\s+[\s\S]*?from\s+['"][^'"]+['"]\s*;?\s*$/gm
const SIDE_EFFECT_IMPORT_RE = /^\s*import\s+['"][^'"]+['"]\s*;?\s*$/gm
const EXPORT_DEFAULT_FN_RE =
  /export\s+default\s+function\s+([A-Za-z_$][\w$]*)/
const EXPORT_FN_RE = /export\s+function\s+([A-Za-z_$][\w$]*)/
const EXPORT_DEFAULT_RE = /export\s+default\s+/
const EXPORT_RE = /^export\s+/gm

/**
 * Patterns a component demo has no reason to contain.
 *
 * This is a guard rail, not a security boundary: the preview is evaluated in a
 * same-origin iframe, and a source-text blacklist cannot stop deliberately
 * obfuscated code (`window["fe" + "tch"]`, `constructor.constructor`, …). It
 * exists to fail loudly when the model drifts towards data access or network
 * calls, so those turns surface as an error instead of quietly running. The
 * real containment is that generated code is only ever executed by the same
 * signed-in user whose prompt produced it — chats are never shared.
 */
const BANNED_RE = [
  /\beval\s*\(/,
  /\bnew\s+Function\s*\(/,
  /\bFunction\s*\(/,
  /\.constructor\b/,
  /\brequire\s*\(/,
  /\bimport\s*\(/,
  /\bfetch\s*\(/,
  /\bXMLHttpRequest\b/,
  /\bWebSocket\b/,
  /\bEventSource\b/,
  /\bnavigator\.sendBeacon\b/,
  /\bprocess\./,
  /\bglobalThis\b/,
  /\bdocument\.cookie\b/,
  /\bdocument\.write\b/,
  /\bwindow\.location\b/,
  /\bwindow\.parent\b/,
  /\bwindow\.top\b/,
  /\bwindow\.open\b/,
  /\bpostMessage\s*\(/,
  /\bdangerouslySetInnerHTML\b/,
  /\bsrcdoc\b/,
  /<\s*script\b/i,
  /\blocalStorage\b/,
  /\bsessionStorage\b/,
  /\bindexedDB\b/,
]

export function prepareGeneratedPreviewSource(raw: string): {
  ok: true
  code: string
} | {
  ok: false
  error: string
} {
  let code = raw.trim()
  if (!code) {
    return { ok: false, error: "Generated preview was empty." }
  }

  const fenced = code.match(FENCE_RE)
  if (fenced?.[1]) {
    code = fenced[1].trim()
  } else {
    code = code.replace(/^```(?:tsx|jsx|ts|js)?\s*/i, "").replace(/```$/i, "").trim()
  }

  code = code.replace(IMPORT_RE, "").replace(SIDE_EFFECT_IMPORT_RE, "").trim()

  if (BANNED_RE.some((pattern) => pattern.test(code))) {
    return { ok: false, error: "Generated preview used a blocked API." }
  }

  const defaultFn = code.match(EXPORT_DEFAULT_FN_RE)
  if (defaultFn?.[1] && defaultFn[1] !== "Preview") {
    code = code.replace(EXPORT_DEFAULT_FN_RE, "function Preview")
  } else {
    code = code.replace(EXPORT_DEFAULT_FN_RE, "function $1")
  }

  const exportedFn = code.match(EXPORT_FN_RE)
  if (exportedFn?.[1] && exportedFn[1] !== "Preview") {
    if (!/\bfunction\s+Preview\b/.test(code) && !/\bPreview\s*=/.test(code)) {
      code = code.replace(EXPORT_FN_RE, "function Preview")
    }
  }

  code = code.replace(/export\s+default\s+Preview\s*;?/, "")
  code = code.replace(/export\s+\{\s*Preview\s*(?:as\s+default)?\s*\}\s*;?/, "")
  code = code.replace(EXPORT_DEFAULT_RE, "const Preview = ")
  code = code.replace(EXPORT_RE, "")

  if (!/\bfunction\s+Preview\b/.test(code) && !/\bPreview\s*=/.test(code)) {
    if (code.startsWith("<")) {
      code = `function Preview() {\n  return (\n    ${code}\n  )\n}`
    } else {
      return {
        ok: false,
        error: "Generated preview must define a Preview function.",
      }
    }
  }

  return { ok: true, code: code.trim() }
}

/**
 * Component identifiers a preview references but the scope does not bind.
 *
 * Unknown names are free variables inside the compiled function, so without
 * this they surface as a `ReferenceError` from deep inside React's render —
 * `DrawerBody is not defined` — with no indication of what is actually
 * available. Checking first turns that into an actionable message, and gives
 * the caller the names to feed back to the model for a repair pass.
 *
 * Only JSX element names are checked. A bare identifier in an expression
 * (`format(...)`) is still a render-time failure.
 */
export function findUnknownComponents(
  code: string,
  scopeNames: Iterable<string>
): string[] {
  const known = new Set(scopeNames)
  const unknown = new Set<string>()

  // `<Foo`, `<Foo.Bar` — capitalised only; lowercase tags are DOM elements.
  for (const match of code.matchAll(/<\s*([A-Z][\w$]*)(?:\.[\w$]+)*/g)) {
    const name = match[1]!
    if (!known.has(name)) {
      unknown.add(name)
    }
  }

  // Locally declared components are fine — the preview may define helpers.
  for (const match of code.matchAll(
    /(?:function|const|let|class)\s+([A-Z][\w$]*)/g
  )) {
    unknown.delete(match[1]!)
  }

  return [...unknown].sort()
}

export type InvalidVariantProp = {
  component: string
  prop: string
  value: string
  allowed: readonly string[]
}

/**
 * Variant/size props set to a value the component's cva does not define.
 *
 * These fail silently: cva matches no branch, emits no class, and the component
 * renders at its default. `<Button size="md">` looked identical to a default
 * button rather than erroring, so the preview was quietly wrong.
 */
export function findInvalidVariantProps(
  code: string,
  variants: Record<string, Record<string, readonly string[]>>
): InvalidVariantProp[] {
  const found: InvalidVariantProp[] = []

  for (const match of code.matchAll(/<\s*([A-Z][\w$]*)([^>]*)>/g)) {
    const component = match[1]!
    const groups = variants[component]
    if (!groups) continue

    for (const attr of match[2]!.matchAll(/([\w-]+)="([^"]*)"/g)) {
      const allowed = groups[attr[1]!]
      if (allowed && !allowed.includes(attr[2]!)) {
        found.push({
          component,
          prop: attr[1]!,
          value: attr[2]!,
          allowed,
        })
      }
    }
  }

  return found
}

export type RawHtmlControl = {
  element: string
  use: string
}

/**
 * Raw HTML form controls used where a scope component exists.
 *
 * The whole point of a preview is to show a preset applied to real components.
 * A bare `<input>` carries none of the `cn-*` classes the style bundles target,
 * so a form built from raw HTML renders as unstyled text — labels running into
 * inputs, no borders, no button — and nothing about it explains why. Layout and
 * text elements are fine; only controls with a component equivalent are caught.
 */
const RAW_CONTROL_REPLACEMENTS: Record<string, string> = {
  input: "Input (or Checkbox, Switch, RadioGroup)",
  button: "Button",
  select: "Select or NativeSelect",
  textarea: "Textarea",
  label: "FieldLabel or Label",
}

export function findRawHtmlControls(code: string): RawHtmlControl[] {
  const found = new Map<string, string>()

  for (const match of code.matchAll(/<\s*([a-z][\w-]*)/g)) {
    const element = match[1]!
    const replacement = RAW_CONTROL_REPLACEMENTS[element]
    if (replacement) {
      found.set(element, replacement)
    }
  }

  return [...found].map(([element, use]) => ({ element, use }))
}

export type InvalidComposition = {
  parent: string
  child: string
  use: string
}

/**
 * Child components that are wrong for their parent, with what to use instead.
 *
 * Only pairings that are always wrong, never matters of taste. `InputGroup`
 * styles itself — border, background, radius, height — and its control is
 * meant to dissolve into that: `InputGroupInput` exists solely to strip the
 * input's own chrome. A plain `Input` keeps it, so the two stack and the field
 * renders as a pill inside a pill. Every other check passes and the preview is
 * visibly broken, which is exactly the kind of mistake worth catching here.
 */
const COMPOSITION_RULES: Record<string, Record<string, string>> = {
  InputGroup: {
    Input: "InputGroupInput",
    Textarea: "InputGroupTextarea",
    Button: "InputGroupButton, inside an InputGroupAddon",
  },
}

type JsxTag = {
  name: string
  closing: boolean
  selfClosing: boolean
  /** Everything between the tag name and the closing angle bracket. */
  attrs: string
  /** Index of this tag's closing angle bracket. */
  end: number
}

/**
 * Walks JSX tags, tolerating `>` inside attribute values and expressions.
 *
 * The simpler `<([A-Z][\w$]*)[^>]*>` used above ends a tag at the first `>`,
 * which an arrow function in a prop (`onClick={() => …}`) supplies early. That
 * is harmless when scanning one tag's own props, but not when tracking
 * nesting: one mis-parsed tag shifts the parent of everything below it.
 *
 * A `<` that is not a tag (`{count < 5}`) is skipped because a name has to
 * follow immediately; `{count<5}` unspaced would fool it. The cost of that is
 * one wasted repair round-trip, not a broken preview.
 */
function* scanJsxTags(code: string): Generator<JsxTag> {
  for (let i = 0; i < code.length; i += 1) {
    if (code[i] !== "<") continue

    let cursor = i + 1
    const closing = code[cursor] === "/"
    if (closing) cursor += 1

    const name = /^[A-Za-z][\w$.]*/.exec(code.slice(cursor))?.[0]
    if (!name) continue
    cursor += name.length

    const attrsStart = cursor
    let braceDepth = 0
    let quote: string | null = null
    let selfClosing = false

    while (cursor < code.length) {
      const char = code[cursor]!
      if (quote) {
        if (char === quote) quote = null
      } else if (char === '"' || char === "'" || char === "`") {
        quote = char
      } else if (char === "{") {
        braceDepth += 1
      } else if (char === "}") {
        braceDepth -= 1
      } else if (char === ">" && braceDepth === 0) {
        selfClosing = code[cursor - 1] === "/"
        break
      }
      cursor += 1
    }

    yield {
      name,
      closing,
      selfClosing,
      attrs: code.slice(attrsStart, cursor),
      end: cursor,
    }
    i = cursor
  }
}

/**
 * Direct children that their parent does not accept.
 *
 * Only direct children count. A control nested inside an addon or a wrapper is
 * left alone: the pairing is no longer the one the rule is about, and a false
 * positive here sends a working preview back for a pointless repair.
 */
export function findInvalidCompositions(code: string): InvalidComposition[] {
  const found = new Map<string, InvalidComposition>()
  const stack: string[] = []

  for (const tag of scanJsxTags(code)) {
    if (tag.closing) {
      stack.pop()
      continue
    }

    const parent = stack[stack.length - 1]
    const use = parent ? COMPOSITION_RULES[parent]?.[tag.name] : undefined
    if (parent && use) {
      found.set(`${parent}>${tag.name}`, { parent, child: tag.name, use })
    }

    if (!tag.selfClosing) {
      stack.push(tag.name)
    }
  }

  return [...found.values()]
}

/**
 * Overlays that render nothing but a trigger until they are opened.
 *
 * `Collapsible` is left out on purpose: closed, it still shows its trigger and
 * a collapsed section is a real thing to demonstrate. These others show the
 * user a lone button and nothing else.
 */
const OVERLAY_COMPONENTS = new Set([
  "AlertDialog",
  "CommandDialog",
  "Dialog",
  "Drawer",
  "DropdownMenu",
  "HoverCard",
  "Popover",
  "Sheet",
  "Tooltip",
])

/** Components whose presence means the preview is a whole screen, not one overlay. */
const PAGE_LEVEL = new Set(["SidebarProvider", "Sidebar", "SidebarInset"])

const OPEN_PROP = /(^|\s)(open|defaultOpen)([=\s/]|$)/

/**
 * The overlay a preview is about, left closed.
 *
 * "Show me a drawer" that renders a button and nothing else has not shown
 * anybody a drawer. Asking for one is asking to see it open, so a preview
 * whose subject is an overlay needs `defaultOpen`.
 *
 * Only when the overlay *is* the subject: exactly one in the whole preview,
 * and no page-level layout around it. A dashboard with a dropdown in its
 * header is a screen that happens to contain an overlay, and forcing that one
 * open would be its own kind of wrong.
 */
export function findClosedOverlay(code: string): string | null {
  const overlays: JsxTag[] = []

  for (const tag of scanJsxTags(code)) {
    if (tag.closing) continue
    if (PAGE_LEVEL.has(tag.name)) return null
    if (OVERLAY_COMPONENTS.has(tag.name)) overlays.push(tag)
  }

  if (overlays.length !== 1) return null
  const [overlay] = overlays
  return OPEN_PROP.test(overlay!.attrs) ? null : overlay!.name
}

/**
 * `asChild` on a component that does not accept it — which is all of them.
 *
 * Every component here is base-ui, which composes through a `render` prop.
 * `asChild` is the Radix idiom, it is what the public shadcn docs show, and it
 * is what the model reaches for — so the prop lands on a base-ui trigger, gets
 * spread onto the DOM, and the trigger renders its own button around the
 * Button it was supposed to become. Two nested buttons, a hydration error, and
 * a React warning about an unknown attribute.
 */
const AS_CHILD_PROP = /(^|\s)asChild([=\s/]|$)/

export function findMisusedAsChild(code: string): string[] {
  const found = new Set<string>()

  for (const tag of scanJsxTags(code)) {
    if (tag.closing) continue
    if (AS_CHILD_PROP.test(tag.attrs)) found.add(tag.name)
  }

  return [...found].sort()
}

/**
 * Controls that must not be stretched, and the parent that stretches them.
 *
 * A `Field` defaults to `orientation="vertical"`, which is `flex-col *:w-full`
 * — right for a label above an input, wrong for anything whose shape is its
 * own. A switch becomes a full-width pill, a checkbox a full-width box, an
 * avatar a full-width circle with the glyph adrift in the middle.
 *
 * These belong beside their label: `<Field orientation="horizontal">`.
 * Full-width is correct for `Input`, `Textarea`, `Select` and `Slider`, so
 * none of them are listed.
 */
const INTRINSIC_WIDTH_CONTROLS = new Set([
  "Avatar",
  "AvatarGroup",
  "Checkbox",
  "RadioGroupItem",
  "Switch",
  "Toggle",
  "ToggleGroup",
])

/** Orientations that lay a field out as a row, leaving children their own width. */
const ROW_ORIENTATION = /orientation=["'](horizontal|responsive)["']/

export function findStretchedControls(code: string): string[] {
  const found = new Set<string>()
  const stack: JsxTag[] = []

  for (const tag of scanJsxTags(code)) {
    if (tag.closing) {
      stack.pop()
      continue
    }

    if (INTRINSIC_WIDTH_CONTROLS.has(tag.name)) {
      // Walk out to the field this control belongs to. Checking only the
      // immediate parent missed the common shape, where the control is put
      // inside a `FieldContent` — which is the text column, not a slot for a
      // control, and is a column, so the control is stretched there too.
      let throughFieldContent = false
      for (let i = stack.length - 1; i >= 0; i -= 1) {
        const ancestor = stack[i]!
        if (ancestor.name === "FieldContent") {
          throughFieldContent = true
          continue
        }
        if (ancestor.name !== "Field") continue
        if (throughFieldContent || !ROW_ORIENTATION.test(ancestor.attrs)) {
          found.add(tag.name)
        }
        // The nearest field decides; an outer one is a different row.
        break
      }
    }

    if (!tag.selfClosing) {
      stack.push(tag)
    }
  }

  return [...found].sort()
}

/** Parents that space their fields apart. */
const FIELD_CONTAINERS = new Set(["FieldGroup", "FieldSet"])

/**
 * Sibling fields with nothing to space them.
 *
 * The gap between fields is not on the field — `.cn-field` is the gap *inside*
 * one. It comes from the container: `.cn-field-group` is `gap-7`,
 * `.cn-field-set` is `gap-6`. Several bare `Field`s in a plain `div` therefore
 * stack flush against each other, each label sitting directly under the
 * control above it.
 */
export function findUngroupedFields(code: string): boolean {
  const stack: Array<{ name: string; fieldChildren: number }> = []

  for (const tag of scanJsxTags(code)) {
    if (tag.closing) {
      const closed = stack.pop()
      if (closed && !FIELD_CONTAINERS.has(closed.name) && closed.fieldChildren > 1) {
        return true
      }
      continue
    }

    const parent = stack[stack.length - 1]
    if (parent && tag.name === "Field") {
      parent.fieldChildren += 1
      if (!FIELD_CONTAINERS.has(parent.name) && parent.fieldChildren > 1) {
        return true
      }
    }

    if (!tag.selfClosing) {
      stack.push({ name: tag.name, fieldChildren: 0 })
    }
  }

  return false
}

/**
 * Components that render nothing unless they are given something to render.
 *
 * A `Toggle` is a button whose content is the whole point — an icon, a word.
 * Written self-closing it is a correctly styled empty box, which is what an
 * on/off setting looks like when a `Switch` was meant.
 */
const CONTENT_REQUIRED = new Set(["Toggle", "Button", "Badge"])

export function findEmptyComponents(code: string): string[] {
  const found = new Set<string>()

  for (const tag of scanJsxTags(code)) {
    if (tag.closing || !CONTENT_REQUIRED.has(tag.name)) continue

    if (tag.selfClosing) {
      found.add(tag.name)
      continue
    }

    // Anything at all between the tags counts — an icon, a word, an
    // expression. Only a straight run to the closing tag is empty.
    const rest = code.slice(tag.end + 1)
    if (new RegExp(`^\\s*</\\s*${tag.name}\\s*>`).test(rest)) {
      found.add(tag.name)
    }
  }

  return [...found].sort()
}

export type MissingProvider = {
  component: string
  root: string
}

/**
 * Families whose parts read a context their root provides.
 *
 * Each of these throws on render — "useSidebar must be used within a
 * SidebarProvider" — so a preview that omits the root is not merely misshapen,
 * it is a red error box. They are the four in `components/cn-ui` that throw;
 * families whose parts degrade quietly are left out, because a rule that fires
 * on working markup costs more than it saves.
 */
const REQUIRED_ROOTS: ReadonlyArray<{ prefix: string; root: string }> = [
  { prefix: "Carousel", root: "Carousel" },
  { prefix: "Chart", root: "ChartContainer" },
  { prefix: "Drawer", root: "Drawer" },
  { prefix: "Sidebar", root: "SidebarProvider" },
]

/**
 * Parts used without the root that gives them their context.
 *
 * Presence anywhere in the preview counts as satisfying it, rather than
 * requiring the root to be an ancestor in the tree. A preview may pull its
 * navigation out into a helper component, and that helper's `SidebarMenu` has
 * no visible ancestor at all — flagging it would send working markup back for
 * repair. What this catches is the root missing altogether, which is the
 * failure that actually happens.
 */
export function findMissingProviders(code: string): MissingProvider[] {
  const found = new Map<string, MissingProvider>()

  for (const tag of scanJsxTags(code)) {
    if (tag.closing) continue

    for (const { prefix, root } of REQUIRED_ROOTS) {
      if (tag.name === root || !tag.name.startsWith(prefix)) continue
      if (new RegExp(`<\\s*${root}\\b`).test(code)) continue
      // The first part reached is the outermost, which is the one worth
      // naming: the others are inside it and fixed by the same wrapper.
      if (!found.has(root)) {
        found.set(root, { component: tag.name, root })
      }
    }
  }

  return [...found.values()]
}

/**
 * Wrappers that style nothing, and the child that does the work.
 *
 * A `SidebarMenuItem` is a bare `<li>` — the padding, the text size, the
 * hover and active states all live on `SidebarMenuButton`. A label dropped
 * straight into the item is unstyled body text sitting in a nav rail, which
 * is the same failure as a raw `<input>` in a form: it renders, and it
 * renders wrong.
 */
const REQUIRED_CHILDREN: Record<string, string> = {
  SidebarMenuItem: "SidebarMenuButton",
}

export type MissingChild = {
  parent: string
  required: string
}

/**
 * Wrappers holding nothing but text.
 *
 * Only when the wrapper contains no component at all. A preview may put its
 * own `<NavItem />` in there, and that helper is free to render the button —
 * requiring the name to appear literally inside would fail working markup.
 */
export function findMissingChildren(code: string): MissingChild[] {
  const found = new Map<string, MissingChild>()
  const stack: Array<{ name: string; hasComponentChild: boolean }> = []

  for (const tag of scanJsxTags(code)) {
    if (tag.closing) {
      const closed = stack.pop()
      const required = closed && REQUIRED_CHILDREN[closed.name]
      if (required && !closed.hasComponentChild) {
        found.set(closed.name, { parent: closed.name, required })
      }
      continue
    }

    const parent = stack[stack.length - 1]
    if (parent && /^[A-Z]/.test(tag.name)) {
      parent.hasComponentChild = true
    }

    if (!tag.selfClosing) {
      stack.push({ name: tag.name, hasComponentChild: false })
    }
  }

  return [...found.values()]
}
