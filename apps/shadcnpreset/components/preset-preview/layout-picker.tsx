"use client"

import { usePathname } from "next/navigation"
import { DotsThreeVerticalIcon } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { trackEvent } from "@/lib/analytics-events"
import { type PresetPreviewPageName } from "@/lib/preset-preview"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

type PresetPreviewLayoutPickerProps = {
  value: PresetPreviewPageName
  onValueChange: (page: PresetPreviewPageName) => void
  presetCode: string
  adHocView?: { page: "generated"; label: string; pending?: boolean }
  className?: string
}

type ViewOption = { page: PresetPreviewPageName; label: string }

/** Shown as tabs. Only the first stays a tab on mobile; the rest join the menu. */
const TAB_VIEWS: ViewOption[] = [
  { page: "preview", label: "Cards 1" },
  { page: "marketing", label: "Marketing" },
  { page: "application", label: "Application" },
  { page: "store", label: "Store" },
]

/** Older views, always behind the "More previews" menu, which marks the active one. */
const MENU_VIEWS: ViewOption[] = [
  { page: "preview-02", label: "Cards 2" },
  { page: "dashboard", label: "Dashboard" },
  { page: "login-02", label: "Login 02" },
  { page: "login-04", label: "Login 04" },
]

const pillClassName = cn(
  "h-auto flex-none rounded-full px-3 py-1 text-sm font-medium shadow-none",
  "text-muted-foreground hover:bg-transparent hover:text-foreground",
  "data-active:bg-secondary data-active:text-secondary-foreground",
  "dark:data-active:bg-secondary dark:data-active:text-secondary-foreground"
)

export function PresetPreviewLayoutPicker({
  value,
  onValueChange,
  presetCode,
  adHocView,
  className,
}: PresetPreviewLayoutPickerProps) {
  const pathname = usePathname()

  function selectView(page: PresetPreviewPageName) {
    if (page === value) return
    onValueChange(page)
    trackEvent("preset_demo_view_select", {
      page_path: pathname,
      preset_code: presetCode,
      demo_view: page,
    })
  }

  return (
    <Tabs
      value={value}
      onValueChange={(next) => selectView(next as PresetPreviewPageName)}
      className={cn("min-w-0", className)}
    >
      <TabsList className="inline-flex h-auto w-fit items-center justify-center rounded-full bg-transparent px-0 text-muted-foreground">
        {TAB_VIEWS.map(({ page, label }, index) => (
          <TabsTrigger
            key={page}
            value={page}
            className={cn(
              pillClassName,
              // Collapse into the menu on mobile.
              index > 0 && "hidden sm:flex"
            )}
          >
            {label}
          </TabsTrigger>
        ))}
        {adHocView ? (
          <TabsTrigger
            value={adHocView.page}
            className={pillClassName}
            disabled={adHocView.pending}
          >
            {adHocView.pending ? (
              // Holds the tab's place while the preview loads, so the row does
              // not shift and no other view looks selected.
              <Skeleton className="h-4 w-20 rounded-full" />
            ) : (
              adHocView.label
            )}
          </TabsTrigger>
        ) : null}

        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger
              render={
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="More previews"
                    />
                  }
                >
                  <DotsThreeVerticalIcon className="size-4" />
                </DropdownMenuTrigger>
              }
            />
            <TooltipContent>More previews</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="start">
            {/* Radio items stay open on click by default; picking a view should close the menu. */}
            <DropdownMenuRadioGroup
              value={value}
              onValueChange={(next) =>
                selectView(next as PresetPreviewPageName)
              }
            >
              {TAB_VIEWS.slice(1).map(({ page, label }) => (
                <DropdownMenuRadioItem
                  key={page}
                  value={page}
                  closeOnClick
                  className="sm:hidden"
                >
                  {label}
                </DropdownMenuRadioItem>
              ))}
              {MENU_VIEWS.map(({ page, label }) => (
                <DropdownMenuRadioItem key={page} value={page} closeOnClick>
                  {label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </TabsList>
    </Tabs>
  )
}
