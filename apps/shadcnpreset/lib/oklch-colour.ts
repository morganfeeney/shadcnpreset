import { converter, displayable, parse } from "culori"

const toOklch = converter("oklch")
const toRgb = converter("rgb")

/** A colour as the picker moves it: lightness 0–1, chroma, hue in degrees. */
export type Lch = { l: number; c: number; h: number }

/** The chroma the picker reaches, a little past what any screen shows. */
export const MAX_CHROMA = 0.37

/** Any CSS colour as lightness, chroma and hue, or null if it isn't one. */
export function readOklch(colour: string): Lch | null {
  const parsed = parse(colour)
  if (!parsed) return null
  const { l, c, h } = toOklch(parsed)
  return { l, c: c ?? 0, h: h ?? 0 }
}

function round(value: number, places: number) {
  const factor = 10 ** places
  return Math.round(value * factor) / factor
}

export function formatOklch({ l, c, h }: Lch) {
  return `oklch(${round(l * 100, 1)}% ${round(c, 3)} ${round(h, 1)})`
}

/**
 * Whether an ordinary (sRGB) screen can show the colour. Wide-gamut screens
 * show more, and browsers show the rest as near as they can, so a colour
 * outside it is kept as given: Tailwind's own palette reaches past it.
 */
export function onScreen({ l, c, h }: Lch) {
  return displayable({ mode: "oklch", l, c, h })
}

/**
 * RGBA pixels for the picker's area at one hue: chroma across, lightness from
 * light at the top to dark at the bottom. Colours an ordinary screen can't
 * show are left clear, so whatever is behind the area marks them.
 */
export function paintArea(hue: number, width: number, height: number) {
  const pixels = new Uint8ClampedArray(width * height * 4)
  for (let y = 0; y < height; y++) {
    const l = 1 - (y + 0.5) / height
    for (let x = 0; x < width; x++) {
      const c = ((x + 0.5) / width) * MAX_CHROMA
      const colour = { mode: "oklch" as const, l, c, h: hue }
      if (!displayable(colour)) continue
      const { r, g, b } = toRgb(colour)
      const i = (y * width + x) * 4
      pixels[i] = r * 255
      pixels[i + 1] = g * 255
      pixels[i + 2] = b * 255
      pixels[i + 3] = 255
    }
  }
  return pixels
}

/** The point in the area a colour sits at, each 0–1 from the top left. */
export function areaPosition({ l, c }: Lch) {
  return { x: Math.min(1, c / MAX_CHROMA), y: 1 - l }
}

/** The colour at a point in the area, keeping the hue it was picked at. */
export function areaColour(x: number, y: number, hue: number): Lch {
  const clamp = (n: number) => Math.min(1, Math.max(0, n))
  return { l: 1 - clamp(y), c: clamp(x) * MAX_CHROMA, h: hue }
}
