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
