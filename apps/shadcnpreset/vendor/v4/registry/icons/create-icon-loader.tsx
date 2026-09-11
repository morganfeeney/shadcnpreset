"use client"

import { use } from "react"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"

type LibraryName = "lucide" | "tabler" | "hugeicons" | "phosphor" | "remixicon"

type IconValue =
  | IconSvgElement
  | React.ComponentType<React.ComponentProps<"svg">>

const iconPromiseCaches = new Map<
  LibraryName,
  Map<string, Promise<IconValue | null>>
>()

function getCache(libraryName: LibraryName) {
  if (!iconPromiseCaches.has(libraryName)) {
    iconPromiseCaches.set(libraryName, new Map())
  }

  return iconPromiseCaches.get(libraryName)!
}

function isIconData(data: IconValue): data is IconSvgElement {
  return Array.isArray(data)
}

/**
 * Imports the generated allowlist rather than the library barrel.
 *
 * `(await import("@tabler/icons-react"))[iconName]` is a dynamic property
 * access on a barrel, which no bundler can tree-shake — it ships the entire
 * icon library to satisfy one lookup. The allowlists are static named
 * re-exports of just the icons this app uses; regenerate them with
 * `pnpm generate:icon-allowlists`.
 */
async function loadIconFromLibrary(
  libraryName: LibraryName,
  iconName: string
): Promise<IconValue | null> {
  const mod = await importAllowlist(libraryName)
  if (!mod) {
    return null
  }
  return (mod as Record<string, IconValue | undefined>)[iconName] ?? null
}

/** Explicit imports so each allowlist gets its own chunk. */
async function importAllowlist(
  libraryName: LibraryName
): Promise<Record<string, unknown> | null> {
  switch (libraryName) {
    case "lucide":
      return await import("./__lucide__")
    case "tabler":
      return await import("./__tabler__")
    case "phosphor":
      return await import("./__phosphor__")
    case "remixicon":
      return await import("./__remixicon__")
    case "hugeicons":
      return await import("./__hugeicons__")
    default:
      return null
  }
}

export function createIconLoader(libraryName: LibraryName) {
  const cache = getCache(libraryName)

  return function IconLoader({
    name,
    strokeWidth = 2,
    ...props
  }: {
    name: string
  } & React.ComponentProps<"svg">) {
    if (!cache.has(name)) {
      cache.set(name, loadIconFromLibrary(libraryName, name))
    }

    const iconData = use(cache.get(name)!)

    if (!iconData) {
      return null
    }

    if (isIconData(iconData)) {
      return (
        // @ts-expect-error: FIX LATER
        <HugeiconsIcon icon={iconData} strokeWidth={strokeWidth} {...props} />
      )
    }

    const IconComponent = iconData
    return <IconComponent {...props} />
  }
}
