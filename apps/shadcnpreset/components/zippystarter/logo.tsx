import type { SVGProps } from "react"

const LOGO_PATHS = [
  "M12 3v17a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a1 1 0 0 1-1 1H3",
  "M16 19h6",
  "M19 22v-6",
] as const

export function Logo({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      className={className}
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {LOGO_PATHS.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  )
}

/**
 * Same mark as {@link Logo} as a data URL — for `next/og` / Satori, which do not render inline SVG.
 * Matches {@link Header1} / LogoLink (icon beside the wordmark).
 */
export function logoMarkDataUrl(options?: {
  stroke?: string
  /** Pixel width/height; viewBox stays 24×24. */
  size?: number
}): string {
  const stroke = options?.stroke ?? "#a1a1aa"
  const size = options?.size ?? 24
  const paths = LOGO_PATHS.map((d) => `<path d="${d}"/>`).join("")
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}
