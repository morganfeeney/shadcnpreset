"use client"

import { usePathname } from "next/navigation"
import { CaretDownIcon, CheckIcon } from "@phosphor-icons/react"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { trackEvent } from "@/lib/analytics-events"
import {
  PRESET_PREVIEW_VIEWS,
  type PresetPreviewPageName,
} from "@/lib/preset-preview"
import { cn } from "@/lib/utils"

type PresetPreviewLayoutPickerProps = {
  value: PresetPreviewPageName
  onValueChange: (page: PresetPreviewPageName) => void
  presetCode: string
  className?: string
}

export function PresetPreviewLayoutPicker({
  value,
  onValueChange,
  presetCode,
  className,
}: PresetPreviewLayoutPickerProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const currentLabel = useMemo(
    () => PRESET_PREVIEW_VIEWS.find((view) => view.page === value)?.label ?? value,
    [value]
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            type="button"
            aria-label="Choose preview layout"
            className={cn(
              "h-8 w-full min-w-42 justify-between gap-2 px-3 text-xs font-normal sm:w-auto",
              className
            )}
          />
        }
      >
        <span className="truncate">{currentLabel}</span>
        <CaretDownIcon className="size-3.5 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent
        className="w-72 p-0"
        side="top"
        align="end"
        sideOffset={8}
      >
        <Command>
          <CommandInput placeholder="Search previews…" />
          <CommandList>
            <CommandEmpty>No preview found.</CommandEmpty>
            <CommandGroup heading="Layouts">
              {PRESET_PREVIEW_VIEWS.map(({ page, label }) => (
                <CommandItem
                  key={page}
                  value={page}
                  keywords={[label, page]}
                  className="[&>svg:last-child]:hidden"
                  onSelect={() => {
                    const previous = value
                    onValueChange(page)
                    setOpen(false)
                    if (page !== previous) {
                      trackEvent("preset_demo_view_select", {
                        page_path: pathname,
                        preset_code: presetCode,
                        demo_view: page,
                      })
                    }
                  }}
                >
                  <span className="truncate">{label}</span>
                  <CheckIcon
                    className={cn(
                      "ml-auto size-4 shrink-0",
                      value === page ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
