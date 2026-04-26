"use client"

import * as React from "react"
import type { IconLibraryName } from "shadcn/icons"

import { IconPlaceholder } from "@/components/icon-placeholder"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/poc/ui/card"

const STYLE_OVERVIEW_TOKENS = [
  "--background",
  "--foreground",
  "--primary",
  "--secondary",
  "--muted",
  "--accent",
  "--border",
  "--chart-1",
  "--chart-2",
  "--chart-3",
  "--chart-4",
  "--chart-5",
] as const

/** Same set as v4 `examples/demo` icon grid. */
const DEMO_ICON_NAMES: Array<Record<IconLibraryName, string>> = [
  {
    lucide: "CopyIcon",
    tabler: "IconCopy",
    hugeicons: "Copy01Icon",
    phosphor: "CopyIcon",
    remixicon: "RiFileCopyLine",
  },
  {
    lucide: "CircleAlertIcon",
    tabler: "IconExclamationCircle",
    hugeicons: "AlertCircleIcon",
    phosphor: "WarningCircleIcon",
    remixicon: "RiErrorWarningLine",
  },
  {
    lucide: "TrashIcon",
    tabler: "IconTrash",
    hugeicons: "Delete02Icon",
    phosphor: "TrashIcon",
    remixicon: "RiDeleteBinLine",
  },
  {
    lucide: "ShareIcon",
    tabler: "IconShare",
    hugeicons: "Share03Icon",
    phosphor: "ShareIcon",
    remixicon: "RiShareLine",
  },
  {
    lucide: "ShoppingBagIcon",
    tabler: "IconShoppingBag",
    hugeicons: "ShoppingBag01Icon",
    phosphor: "BagIcon",
    remixicon: "RiShoppingBagLine",
  },
  {
    lucide: "MoreHorizontalIcon",
    tabler: "IconDots",
    hugeicons: "MoreHorizontalCircle01Icon",
    phosphor: "DotsThreeIcon",
    remixicon: "RiMoreLine",
  },
  {
    lucide: "Loader2Icon",
    tabler: "IconLoader",
    hugeicons: "Loading03Icon",
    phosphor: "SpinnerIcon",
    remixicon: "RiLoaderLine",
  },
  {
    lucide: "PlusIcon",
    tabler: "IconPlus",
    hugeicons: "PlusSignIcon",
    phosphor: "PlusIcon",
    remixicon: "RiAddLine",
  },
  {
    lucide: "MinusIcon",
    tabler: "IconMinus",
    hugeicons: "MinusSignIcon",
    phosphor: "MinusIcon",
    remixicon: "RiSubtractLine",
  },
  {
    lucide: "ArrowLeftIcon",
    tabler: "IconArrowLeft",
    hugeicons: "ArrowLeft02Icon",
    phosphor: "ArrowLeftIcon",
    remixicon: "RiArrowLeftLine",
  },
  {
    lucide: "ArrowRightIcon",
    tabler: "IconArrowRight",
    hugeicons: "ArrowRight02Icon",
    phosphor: "ArrowRightIcon",
    remixicon: "RiArrowRightLine",
  },
  {
    lucide: "CheckIcon",
    tabler: "IconCheck",
    hugeicons: "Tick02Icon",
    phosphor: "CheckIcon",
    remixicon: "RiCheckLine",
  },
  {
    lucide: "ChevronDownIcon",
    tabler: "IconChevronDown",
    hugeicons: "ArrowDown01Icon",
    phosphor: "CaretDownIcon",
    remixicon: "RiArrowDownSLine",
  },
  {
    lucide: "ChevronRightIcon",
    tabler: "IconChevronRight",
    hugeicons: "ArrowRight01Icon",
    phosphor: "CaretRightIcon",
    remixicon: "RiArrowRightSLine",
  },
  {
    lucide: "SearchIcon",
    tabler: "IconSearch",
    hugeicons: "Search01Icon",
    phosphor: "MagnifyingGlassIcon",
    remixicon: "RiSearchLine",
  },
  {
    lucide: "SettingsIcon",
    tabler: "IconSettings",
    hugeicons: "Settings01Icon",
    phosphor: "GearIcon",
    remixicon: "RiSettingsLine",
  },
]

type PresetSwatchStyleOverviewCardProps = {
  /** From decoded preset; drives which set of `IconPlaceholder` names is shown. */
  iconLibrary: IconLibraryName
}

/**
 * v4 `examples/demo` left column: Style Overview + icon grid, using PoC `Card` and
 * shared `IconPlaceholder` (with `iconLibrary` override for routes without /create).
 */
export function PresetSwatchStyleOverviewCard({
  iconLibrary,
}: PresetSwatchStyleOverviewCardProps) {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Style Overview</CardTitle>
          <CardDescription className="line-clamp-2">
            Designers love packing quirky glyphs into test phrases. This is a
            preview of the typography styles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 gap-3">
            {STYLE_OVERVIEW_TOKENS.map((variant) => (
              <div
                key={variant}
                className="flex flex-col flex-wrap items-center gap-2"
              >
                <div
                  className="relative aspect-square w-full rounded-lg bg-(--color) after:absolute after:inset-0 after:rounded-lg after:border after:border-border after:mix-blend-darken dark:after:mix-blend-lighten"
                  style={
                    {
                      "--color": `var(${variant})`,
                    } as React.CSSProperties
                  }
                />
                <div className="hidden max-w-14 truncate font-mono text-[0.60rem] md:block">
                  {variant}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <div className="grid grid-cols-8 place-items-center gap-4">
            {DEMO_ICON_NAMES.map((names) => (
              <Card
                key={names.lucide}
                className="flex size-8 items-center justify-center p-0 shadow-none *:[svg]:size-4"
              >
                <IconPlaceholder iconLibrary={iconLibrary} {...names} />
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
