export const GEIST_MONO = "Geist Mono"
export const INTER = "Inter"

/**
 * Satori needs real font data, so each face ships as base64 JSON rather than a
 * binary asset the bundler would have to trace into the edge runtime.
 *
 * It also has no system fonts: a `ui-sans-serif, system-ui` stack resolves to
 * nothing and silently falls back to whichever face is loaded. Anything meant
 * to render in the site's sans has to load {@link loadInterMedium} and name
 * {@link INTER} explicitly.
 */
async function loadBase64Font(
  importer: () => Promise<unknown>,
  name: string,
  weight: 400 | 500
) {
  const mod = (await importer()) as { default?: { base64Font: string } }
  const data = mod.default ?? mod
  const { base64Font } = data as { base64Font: string }
  return {
    name,
    data: Buffer.from(base64Font, "base64"),
    weight,
    style: "normal" as const,
  }
}

export function loadGeistMono() {
  return loadBase64Font(
    () => import("@/lib/og/geistmono-regular-otf.json"),
    GEIST_MONO,
    400
  )
}

/** Inter 500 — the weight behind the site's `font-display` headings. */
export function loadInterMedium() {
  return loadBase64Font(
    () => import("@/lib/og/inter-medium-ttf.json"),
    INTER,
    500
  )
}
