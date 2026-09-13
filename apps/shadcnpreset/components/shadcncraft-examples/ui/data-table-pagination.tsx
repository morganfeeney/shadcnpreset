"use client"

import * as React from "react"
import type { Table as TanStackTable } from "@tanstack/react-table"

import { cn } from "@/lib/utils"
import { Button } from "@/components/cn-ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/cn-ui/select"
import { IconPlaceholder } from "@/components/icon-placeholder"

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50]

/**
 * What the footer parts read and do. The row type stays inside
 * <DataTablePagination />, so nothing below it has to be generic.
 */
type DataTablePaginationContextValue = {
  pageIndex: number
  pageSize: number
  pageCount: number
  currentPage: number
  filteredCount: number
  selectedCount: number
  rangeStart: number
  rangeEnd: number
  canPreviousPage: boolean
  canNextPage: boolean
  setPageSize: (pageSize: number) => void
  firstPage: () => void
  previousPage: () => void
  nextPage: () => void
  lastPage: () => void
}

const DataTablePaginationContext =
  React.createContext<DataTablePaginationContextValue | null>(null)

/**
 * Pagination state of the closest <DataTablePagination />: page bounds,
 * filtered/selected counts, current row range, and the navigation actions.
 */
function useDataTablePagination() {
  const context = React.useContext(DataTablePaginationContext)

  if (!context) {
    throw new Error(
      "useDataTablePagination must be used within a <DataTablePagination />"
    )
  }

  return context
}

function getPaginationState<TData>(
  table: TanStackTable<TData>
): DataTablePaginationContextValue {
  const { pageIndex, pageSize } = table.getState().pagination
  const filteredCount = table.getFilteredRowModel().rows.length
  const pageCount = Math.max(1, table.getPageCount())

  return {
    pageIndex,
    pageSize,
    pageCount,
    currentPage: Math.min(pageIndex + 1, pageCount),
    filteredCount,
    selectedCount: table.getFilteredSelectedRowModel().rows.length,
    rangeStart: filteredCount === 0 ? 0 : pageIndex * pageSize + 1,
    rangeEnd: Math.min((pageIndex + 1) * pageSize, filteredCount),
    canPreviousPage: table.getCanPreviousPage(),
    canNextPage: table.getCanNextPage(),
    setPageSize: (size) => table.setPageSize(size),
    firstPage: () => table.setPageIndex(0),
    previousPage: () => table.previousPage(),
    nextPage: () => table.nextPage(),
    lastPage: () => table.setPageIndex(table.getPageCount() - 1),
  }
}

/**
 * Pagination footer for a TanStack table.
 *
 * Renders the default layout (selection summary + rows-per-page + page
 * indicator + navigation) when no children are provided, or composes freely
 * with the exported parts.
 */
function DataTablePagination<TData>({
  table,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  table: TanStackTable<TData>
}) {
  "use no memo"

  return (
    <DataTablePaginationContext.Provider value={getPaginationState(table)}>
      <div
        data-slot="data-table-pagination"
        className={cn(
          "flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between",
          className
        )}
        {...props}
      >
        {children ?? (
          <>
            <DataTablePaginationInfo />
            <DataTablePaginationControls>
              <DataTablePaginationPageSize />
              <DataTablePaginationPageInfo />
              <DataTablePaginationButtons />
            </DataTablePaginationControls>
          </>
        )}
      </div>
    </DataTablePaginationContext.Provider>
  )
}

/** Leading summary text. Defaults to the selected-rows count. */
function DataTablePaginationInfo({
  className,
  children,
  ...props
}: React.ComponentProps<"p">) {
  const { selectedCount, filteredCount } = useDataTablePagination()

  return (
    <p
      data-slot="data-table-pagination-info"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    >
      {children ?? `${selectedCount} of ${filteredCount} row(s) selected`}
    </p>
  )
}

/** Trailing cluster that groups the page-size, page indicator and buttons. */
function DataTablePaginationControls({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="data-table-pagination-controls"
      className={cn("flex flex-wrap items-center gap-3 lg:gap-7", className)}
      {...props}
    />
  )
}

/** Rows-per-page select. */
function DataTablePaginationPageSize({
  className,
  label = "Rows per page",
  options = DEFAULT_PAGE_SIZE_OPTIONS,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & {
  label?: React.ReactNode
  options?: number[]
}) {
  const { pageSize, setPageSize } = useDataTablePagination()

  return (
    <div
      data-slot="data-table-pagination-page-size"
      className={cn("flex items-center gap-1.5", className)}
      {...props}
    >
      {label && <span className="text-sm font-medium">{label}</span>}

      <Select
        value={String(pageSize)}
        onValueChange={(value) => setPageSize(Number(value))}
      >
        <SelectTrigger size="sm" className="w-16">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((size) => (
            <SelectItem key={size} value={String(size)}>
              {size}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

/** Current page indicator. */
function DataTablePaginationPageInfo({
  className,
  children,
  ...props
}: React.ComponentProps<"span">) {
  const { currentPage, pageCount } = useDataTablePagination()

  return (
    <span
      data-slot="data-table-pagination-page-info"
      className={cn("text-sm", className)}
      {...props}
    >
      {children ?? `Page ${currentPage} of ${pageCount}`}
    </span>
  )
}

type DataTablePaginationAction = "first" | "previous" | "next" | "last"

const PAGINATION_ACTIONS: Record<
  DataTablePaginationAction,
  {
    label: string
    icon: React.ReactNode
    canNavigate: (pagination: DataTablePaginationContextValue) => boolean
    navigate: (pagination: DataTablePaginationContextValue) => void
  }
> = {
  first: {
    label: "Go to first page",
    icon: (
      <IconPlaceholder
        lucide="ChevronsLeftIcon"
        tabler="IconChevronsLeft"
        hugeicons="ArrowLeftDoubleIcon"
        phosphor="CaretDoubleLeftIcon"
        remixicon="RiArrowLeftDoubleLine"
        className="cn-rtl-flip"
      />
    ),
    canNavigate: ({ canPreviousPage }) => canPreviousPage,
    navigate: ({ firstPage }) => firstPage(),
  },
  previous: {
    label: "Go to previous page",
    icon: (
      <IconPlaceholder
        lucide="ChevronLeftIcon"
        tabler="IconChevronLeft"
        hugeicons="ArrowLeft01Icon"
        phosphor="CaretLeftIcon"
        remixicon="RiArrowLeftSLine"
        className="cn-rtl-flip"
      />
    ),
    canNavigate: ({ canPreviousPage }) => canPreviousPage,
    navigate: ({ previousPage }) => previousPage(),
  },
  next: {
    label: "Go to next page",
    icon: (
      <IconPlaceholder
        lucide="ChevronRightIcon"
        tabler="IconChevronRight"
        hugeicons="ArrowRight01Icon"
        phosphor="CaretRightIcon"
        remixicon="RiArrowRightSLine"
        className="cn-rtl-flip"
      />
    ),
    canNavigate: ({ canNextPage }) => canNextPage,
    navigate: ({ nextPage }) => nextPage(),
  },
  last: {
    label: "Go to last page",
    icon: (
      <IconPlaceholder
        lucide="ChevronsRightIcon"
        tabler="IconChevronsRight"
        hugeicons="ArrowRightDoubleIcon"
        phosphor="CaretDoubleRightIcon"
        remixicon="RiArrowRightDoubleLine"
        className="cn-rtl-flip"
      />
    ),
    canNavigate: ({ canNextPage }) => canNextPage,
    navigate: ({ lastPage }) => lastPage(),
  },
}

/**
 * A single navigation button. Renders the matching chevron by default; pass
 * children to use a label instead ("Previous" / "Next").
 */
function DataTablePaginationButton({
  action,
  variant = "outline",
  size = "icon-sm",
  disabled,
  onClick,
  children,
  ...props
}: React.ComponentProps<typeof Button> & {
  action: DataTablePaginationAction
}) {
  const pagination = useDataTablePagination()
  const { label, icon, canNavigate, navigate } = PAGINATION_ACTIONS[action]

  return (
    <Button
      data-slot="data-table-pagination-button"
      data-action={action}
      variant={variant}
      size={size}
      disabled={disabled ?? !canNavigate(pagination)}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) {
          navigate(pagination)
        }
      }}
      {...props}
    >
      {children ?? (
        <>
          <span className="sr-only">{label}</span>
          {icon}
        </>
      )}
    </Button>
  )
}

/** First / previous / next / last buttons. Set `edges={false}` to drop first and last. */
function DataTablePaginationButtons({
  className,
  edges = true,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & {
  edges?: boolean
}) {
  return (
    <div
      data-slot="data-table-pagination-buttons"
      className={cn("flex items-center gap-1.5", className)}
      {...props}
    >
      {edges && <DataTablePaginationButton action="first" />}
      <DataTablePaginationButton action="previous" />
      <DataTablePaginationButton action="next" />
      {edges && <DataTablePaginationButton action="last" />}
    </div>
  )
}

export {
  DataTablePagination,
  DataTablePaginationButton,
  DataTablePaginationButtons,
  DataTablePaginationControls,
  DataTablePaginationInfo,
  DataTablePaginationPageInfo,
  DataTablePaginationPageSize,
  useDataTablePagination,
  type DataTablePaginationAction,
  type DataTablePaginationContextValue,
}
