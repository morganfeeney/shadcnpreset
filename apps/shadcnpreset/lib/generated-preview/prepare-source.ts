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
