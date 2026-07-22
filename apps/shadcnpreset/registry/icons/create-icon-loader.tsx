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

async function loadIconFromLibrary(
  libraryName: LibraryName,
  iconName: string
): Promise<IconValue | null> {
  switch (libraryName) {
    case "lucide": {
      const mod = await import("lucide-react")
      return (
        (mod as unknown as Record<string, IconValue | undefined>)[iconName] ??
        null
      )
    }
    case "tabler": {
      const mod = await import("@tabler/icons-react")
      return (
        (mod as unknown as Record<string, IconValue | undefined>)[iconName] ??
        null
      )
    }
    case "phosphor": {
      const mod = await import("@phosphor-icons/react")
      return (
        (mod as unknown as Record<string, IconValue | undefined>)[iconName] ??
        null
      )
    }
    case "remixicon": {
      const mod = await import("@remixicon/react")
      return (
        (mod as unknown as Record<string, IconValue | undefined>)[iconName] ??
        null
      )
    }
    case "hugeicons": {
      const mod = await import("@hugeicons/core-free-icons")
      return (mod as Record<string, IconValue | undefined>)[iconName] ?? null
    }
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
