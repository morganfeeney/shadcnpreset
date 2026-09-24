import { isPresetCode } from "shadcn/preset"

import {
  builtPageParams,
  readBuiltPageSpec,
  type BuiltPageSpec,
} from "@/lib/page-builder/messages"

/** A page as the builder's URL keeps it: what the preview needs, and its preset. */
export type SavedPage = { spec: BuiltPageSpec; preset: string | null }

function isEmpty(spec: BuiltPageSpec) {
  return (
    !spec.blocks.length && Object.values(spec.layout).every((id) => id === null)
  )
}

/**
 * The builder's query string for a page, so a reload or a shared link opens
 * it as it was — without asking Jev again. Empty for an empty page, which
 * leaves a fresh builder at plain `/build`.
 */
export function savedPageQuery(spec: BuiltPageSpec, preset: string): string {
  if (isEmpty(spec)) return ""
  const params = builtPageParams(spec)
  params.set("preset", preset)
  return params.toString()
}

/**
 * The page in the builder's URL, or null when it holds none. `blocks` marks a
 * saved page, so its missing slots read as deliberately empty rather than
 * as the defaults a fresh page starts with.
 */
export function readSavedPage(
  query: Partial<Record<string, string | string[] | undefined>>
): SavedPage | null {
  const first = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value
  const blocks = first(query.blocks)
  if (blocks === undefined) return null
  const spec = readBuiltPageSpec({
    blocks,
    header: first(query.header),
    sidebar: first(query.sidebar),
    footer: first(query.footer),
  })
  if (isEmpty(spec)) return null
  const preset = first(query.preset)
  return { spec, preset: preset && isPresetCode(preset) ? preset : null }
}
