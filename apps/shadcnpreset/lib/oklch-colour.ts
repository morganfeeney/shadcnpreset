import { converter, displayable, parse } from "culori"

const toOklch = converter("oklch")

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
 * Linear sRGB for an OKLCH colour: Björn Ottosson's OKLab matrices, written
 * out so the area can be painted a whole retina canvas at a time.
 */
function linearRgb(l: number, c: number, h: number) {
  const a = c * Math.cos((h * Math.PI) / 180)
  const b = c * Math.sin((h * Math.PI) / 180)
  const l3 = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m3 = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s3 = (l - 0.0894841775 * a - 1.291485548 * b) ** 3
  return [
    4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3,
    -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3,
    -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3,
  ]
}

function inSrgb(l: number, c: number, h: number) {
  return linearRgb(l, c, h).every((v) => v >= -1e-6 && v <= 1 + 1e-6)
}

/** The 0–255 sRGB value of a linear channel. */
function encode(v: number) {
  const clamped = Math.min(1, Math.max(0, v))
  const srgb =
    clamped <= 0.0031308
      ? 12.92 * clamped
      : 1.055 * clamped ** (1 / 2.4) - 0.055
  return srgb * 255
}

/**
 * The most chroma an ordinary screen shows at a lightness and hue. At one
 * lightness and hue, the colours it shows run from grey out to this.
 */
export function maxOnScreenChroma(l: number, h: number) {
  let low = 0
  let high = MAX_CHROMA
  if (inSrgb(l, high, h)) return high
  for (let i = 0; i < 24; i++) {
    const mid = (low + high) / 2
    if (inSrgb(l, mid, h)) low = mid
    else high = mid
  }
  return low
}

/**
 * RGBA pixels for the picker's area at one hue: chroma across, lightness from
 * light at the top to dark at the bottom. Colours an ordinary screen can't
 * show are left clear, so whatever is behind the area marks them; the pixel
 * each row's edge falls in is partly clear, so the edge is a smooth line.
 */
export function paintArea(hue: number, width: number, height: number) {
  const pixels = new Uint8ClampedArray(width * height * 4)
  for (let y = 0; y < height; y++) {
    const l = 1 - (y + 0.5) / height
    const edge = (maxOnScreenChroma(l, hue) / MAX_CHROMA) * width
    for (let x = 0; x < width && x < edge; x++) {
      const [r, g, b] = linearRgb(l, ((x + 0.5) / width) * MAX_CHROMA, hue)
      const i = (y * width + x) * 4
      pixels[i] = encode(r)
      pixels[i + 1] = encode(g)
      pixels[i + 2] = encode(b)
      pixels[i + 3] = Math.min(1, edge - x) * 255
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
