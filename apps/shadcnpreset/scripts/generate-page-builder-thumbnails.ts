/**
 * Screenshots every block in the page builder's catalog, in light and dark,
 * for the builder's block browser. shadcncraft's registry carries no preview
 * images, so these come from our own preview route, in the default preset.
 *
 *   pnpm dev                                  # in another terminal
 *   pnpm generate:page-builder-thumbnails     # new blocks only
 *   pnpm generate:page-builder-thumbnails --force
 *   pnpm generate:page-builder-thumbnails hero-2 footer-1   # just these
 *
 * Writes public/page-builder/thumbnails/{light,dark}/<block id>.jpg. Uses the
 * Chromium Playwright has installed; BUILD_URL points it at another server.
 */
import { existsSync, mkdirSync } from "node:fs"
import path from "node:path"
import { chromium, type Browser } from "playwright-core"
import { DEFAULT_PRESET_CONFIG, encodePreset } from "shadcn/preset"

import { sectionOfBlock } from "../lib/page-builder/blocks"
import { builtPageSrc, type BuiltPageSpec } from "../lib/page-builder/messages"
import {
  LAYOUT_CATEGORIES,
  LAYOUT_SLOTS,
  type LayoutSlot,
} from "../lib/page-builder/sections"
import { PAGE_BLOCK_VARIANTS } from "../lib/page-builder/variants"

const ROOT = path.resolve(import.meta.dirname, "..")
const OUT = path.join(ROOT, "public/page-builder/thumbnails")
const BASE_URL = process.env.BUILD_URL ?? "http://localhost:4010"
const PRESET = encodePreset(DEFAULT_PRESET_CONFIG)
const THEMES = ["light", "dark"] as const
const VIEWPORT = { width: 1280, height: 800 }
/** 1280 CSS px at 0.4 is a 512 px image: sharp at the sidebar's card width. */
const SCALE = 0.4
const CONCURRENCY = 4
const NO_LAYOUT = { header: null, sidebar: null, footer: null }

type Shot = {
  id: string
  spec: BuiltPageSpec
  /** Where the block is on the page; null shoots the whole viewport. */
  selector: string | null
}

function slotOf(section: string): LayoutSlot | null {
  return (
    LAYOUT_SLOTS.find((slot) =>
      LAYOUT_CATEGORIES[slot].some((category) => category.id === section)
    ) ?? null
  )
}

/** Each block on its own, framed the way it would be used. */
function shotFor(id: string): Shot {
  const section = sectionOfBlock(id)
  const slot = slotOf(section)
  if (slot === "sidebar") {
    // A sidebar alone is a tall sliver; the shell around it shows what it is.
    return {
      id,
      spec: { blocks: [], layout: { ...NO_LAYOUT, sidebar: id } },
      selector: null,
    }
  }
  if (slot) {
    return {
      id,
      spec: { blocks: [], layout: { ...NO_LAYOUT, [slot]: id } },
      selector: `[data-block="${id}"]`,
    }
  }
  return {
    id,
    spec: { blocks: [id], layout: NO_LAYOUT },
    selector: `[data-block="${id}"]`,
  }
}

async function shoot(
  browser: Browser,
  theme: (typeof THEMES)[number],
  shot: Shot
) {
  const file = path.join(OUT, theme, `${shot.id}.jpg`)
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: SCALE,
    colorScheme: theme,
  })
  const page = await context.newPage()
  try {
    await page.goto(`${BASE_URL}${builtPageSrc(PRESET, shot.spec)}`, {
      waitUntil: "load",
      timeout: 120_000,
    })
    // The dev server's Next.js indicator would sit in every bottom-left corner.
    await page.addStyleTag({
      content: "nextjs-portal { display: none !important; }",
    })
    const target = page.locator(
      shot.selector ?? '[data-slot="sidebar-container"]'
    )
    await target.first().waitFor({ state: "visible", timeout: 60_000 })
    // Photos and fonts inside the block, then a beat for charts to animate in.
    // Some blocks never go quiet (a looping marquee keeps fetching), so the
    // network gets a while to settle rather than a deadline to meet.
    await page
      .waitForLoadState("networkidle", { timeout: 15_000 })
      .catch(() => {})
    await page.evaluate(() => document.fonts.ready)
    // Some of shadcncraft's photos take minutes to arrive; a thumbnail with
    // half a photo is worse than a slow run.
    await page.waitForFunction(
      () =>
        [...document.images].every(
          (image) => image.complete && image.naturalWidth > 0
        ),
      undefined,
      { timeout: 180_000 }
    )
    await page.waitForTimeout(800)

    if (!shot.selector) {
      await page.screenshot({ path: file, type: "jpeg", quality: 72 })
      return
    }
    const box = await target.first().boundingBox()
    if (!box) throw new Error("no bounding box")
    await page.screenshot({
      path: file,
      type: "jpeg",
      quality: 72,
      // Tall blocks keep their top, as a visitor first sees them.
      clip: {
        x: box.x,
        y: box.y,
        width: box.width,
        height: Math.min(box.height, VIEWPORT.height),
      },
    })
  } finally {
    await context.close()
  }
}

async function main() {
  const force = process.argv.includes("--force")
  const only = process.argv.slice(2).filter((arg) => !arg.startsWith("--"))
  const ids = Object.values(PAGE_BLOCK_VARIANTS)
    .flat()
    .map((variant) => variant.id)
    .filter((id) => !only.length || only.includes(id))
  const jobs = THEMES.flatMap((theme) =>
    ids
      .filter((id) => force || !existsSync(path.join(OUT, theme, `${id}.jpg`)))
      .map((id) => ({ theme, shot: shotFor(id) }))
  )
  for (const theme of THEMES)
    mkdirSync(path.join(OUT, theme), { recursive: true })
  console.log(`${jobs.length} thumbnails to take from ${BASE_URL}`)

  const browser = await chromium.launch()
  const failed: string[] = []
  let done = 0
  const queue = [...jobs]
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      for (let job = queue.shift(); job; job = queue.shift()) {
        try {
          await shoot(browser, job.theme, job.shot)
        } catch (error) {
          failed.push(
            `${job.theme}/${job.shot.id}: ${(error as Error).message.split("\n")[0]}`
          )
        }
        done += 1
        if (done % 20 === 0) console.log(`${done}/${jobs.length}`)
      }
    })
  )
  await browser.close()

  console.log(`Took ${jobs.length - failed.length} of ${jobs.length}.`)
  if (failed.length) {
    console.log(`Failed:\n  ${failed.join("\n  ")}`)
    process.exitCode = 1
  }
}

void main()
