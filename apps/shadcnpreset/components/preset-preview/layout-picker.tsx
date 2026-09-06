"use client"

import { usePathname } from "next/navigation"
import { DotsThreeVerticalIcon } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { cn } from "@/lib/utils"

type PresetPreviewLayoutPickerProps = {
  value: PresetPreviewPageName
  onValueChange: (page: PresetPreviewPageName) => void
  presetCode: string
  className?: string
}

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
        <TabsTrigger value="preview" className={pillClassName}>
          View 1
        </TabsTrigger>
        <TabsTrigger value="preview-02" className={pillClassName}>
          View 2
        </TabsTrigger>
        <TabsTrigger value="dashboard" className={cn(pillClassName, "hidden min-[400px]:flex")}>
          Dashboard
        </TabsTrigger>
        <TabsTrigger value="login-02" className={cn(pillClassName, "hidden sm:flex")}>
          Login 02
        </TabsTrigger>
        <TabsTrigger value="login-04" className={cn(pillClassName, "hidden sm:flex")}>
          Login 04
        </TabsTrigger>

        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger
              render={
                <DropdownMenuTrigger
                  className="hidden max-sm:flex"
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
            <DropdownMenuItem
              className="md:hidden"
              onClick={() => selectView("dashboard")}
            >
              Dashboard
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => selectView("login-02")}>
              Login 02
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => selectView("login-04")}>
              Login 04
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TabsList>
    </Tabs>
  )
}
