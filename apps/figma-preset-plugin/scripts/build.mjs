import { mkdir } from "node:fs/promises"
import { resolve } from "node:path"

import { build } from "esbuild"

const root = resolve(import.meta.dirname, "..")
const outdir = resolve(root, "dist")

await mkdir(outdir, { recursive: true })

await build({
  entryPoints: [resolve(root, "src/code.ts")],
  outfile: resolve(outdir, "code.js"),
  bundle: true,
  format: "iife",
  platform: "browser",
  target: "es2017",
  sourcemap: true,
  logLevel: "info",
})
