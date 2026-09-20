"use client"

import * as React from "react"

import { Button } from "@/components/cn-ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/cn-ui/dropdown-menu"
import { Separator } from "@/components/cn-ui/separator"
import { SidebarTrigger } from "@/components/cn-ui/sidebar"
import { IconPlaceholder } from "@/components/icon-placeholder"

const PAGES = ["Home", "Reports", "Audiences", "Automations"]

const FILTERS = [
  { id: "unread", label: "Unread only" },
  { id: "assigned", label: "Assigned to me" },
  { id: "archived", label: "Include archived" },
]

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]

/**
 * A literal, not something derived from today: the server and the client have
 * to agree on the first paint. The presets replace it once one is pressed.
 */
const DEFAULT_RANGE = "Feb 04 - Feb 11 2024"

function formatRange(from: Date, to: Date) {
  const day = (date: Date) =>
    `${MONTHS[date.getMonth()]} ${String(date.getDate()).padStart(2, "0")}`
  const end = `${day(to)} ${to.getFullYear()}`
  return from.toDateString() === to.toDateString()
    ? end
    : `${day(from)} - ${end}`
}

function daysAgo(count: number) {
  const date = new Date()
  date.setDate(date.getDate() - count)
  return date
}

/** Needs a `SidebarProvider` above it: the toggle is a `SidebarTrigger`. */
export function AppShellHeader1() {
  const [page, setPage] = React.useState(PAGES[0])
  const [range, setRange] = React.useState(DEFAULT_RANGE)
  const [activeFilters, setActiveFilters] = React.useState<string[]>([])

  function toggleFilter(id: string) {
    setActiveFilters((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    )
  }

  const filtersMenu = (
    <DropdownMenuContent className="min-w-48" align="end">
      {/* Base UI resolves the label against this group and throws without it. */}
      <DropdownMenuGroup>
        <DropdownMenuLabel>Filters</DropdownMenuLabel>
        {FILTERS.map((filter) => (
          <DropdownMenuCheckboxItem
            key={filter.id}
            checked={activeFilters.includes(filter.id)}
            // Radix kept the menu open via onSelect+preventDefault; Base UI
            // checkbox items stay open on click already.
            onCheckedChange={() => toggleFilter(filter.id)}
          >
            {filter.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        disabled={activeFilters.length === 0}
        onClick={() => setActiveFilters([])}
      >
        Clear filters
      </DropdownMenuItem>
    </DropdownMenuContent>
  )

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
      <SidebarTrigger />

      <Separator
        orientation="vertical"
        className="data-[orientation=vertical]:h-6 data-[orientation=vertical]:self-center"
      />

      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" />}>
          {page}
          <IconPlaceholder
            lucide="ChevronsUpDown"
            tabler="IconSelector"
            hugeicons="UnfoldMoreIcon"
            phosphor="CaretUpDownIcon"
            remixicon="RiExpandUpDownLine"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-48" align="start">
          {PAGES.map((item) => (
            <DropdownMenuItem key={item} onClick={() => setPage(item)}>
              {item}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex flex-1 items-center justify-between gap-2 max-md:hidden">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setRange(formatRange(new Date(), new Date()))}
          >
            Today
          </Button>
          <Button
            variant="outline"
            onClick={() => setRange(formatRange(daysAgo(6), new Date()))}
          >
            Last 7 days
          </Button>
          <p aria-live="polite" className="truncate text-sm font-medium">
            {range}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" />}>
              Filters
              <IconPlaceholder
                lucide="ChevronDown"
                tabler="IconChevronDown"
                hugeicons="ArrowDown01Icon"
                phosphor="CaretDownIcon"
                remixicon="RiArrowDownSLine"
              />
            </DropdownMenuTrigger>
            {filtersMenu}
          </DropdownMenu>

          {/* Inert: settings and search belong to the app this shell wraps. */}
          <Button variant="outline">Settings</Button>

          <Button variant="ghost" size="icon">
            <IconPlaceholder
              lucide="Search"
              tabler="IconSearch"
              hugeicons="Search01Icon"
              phosphor="MagnifyingGlassIcon"
              remixicon="RiSearchLine"
            />
            <span className="sr-only">Search</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-end md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" size="icon-sm" />}
          >
            <IconPlaceholder
              lucide="SlidersHorizontal"
              tabler="IconAdjustmentsHorizontal"
              hugeicons="FilterHorizontalIcon"
              phosphor="FadersHorizontalIcon"
              remixicon="RiEqualizerLine"
            />
            <span className="sr-only">Filters</span>
          </DropdownMenuTrigger>
          {filtersMenu}
        </DropdownMenu>
      </div>
    </header>
  )
}
