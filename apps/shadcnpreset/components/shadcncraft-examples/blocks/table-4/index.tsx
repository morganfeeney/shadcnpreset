"use client"

import * as React from "react"
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  type FilterFn,
  type PaginationState,
  type Row,
  type RowData,
  type RowSelectionState,
  type SortDirection,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table"
import { format, parseISO } from "date-fns"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/cn-ui/avatar"
import { Button } from "@/components/cn-ui/button"
import { Checkbox } from "@/components/cn-ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/cn-ui/dropdown-menu"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/cn-ui/empty"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/cn-ui/input-group"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/cn-ui/item"
import { Badge } from "@/components/cn-ui/badge"
import {
  DataTablePagination,
  DataTablePaginationButtons,
  DataTablePaginationControls,
  DataTablePaginationInfo,
  DataTablePaginationPageInfo,
  DataTablePaginationPageSize,
} from "@/components/shadcncraft-examples/ui/data-table-pagination"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/cn-ui/table"
import { IconPlaceholder } from "@/components/icon-placeholder"

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    width?: string | number
  }
}

type MemberRole = "Owner" | "Admin" | "Member" | "Viewer"
type MemberStatus = "Active" | "Offline" | "Invited"

type Member = {
  id: string
  name: string
  email: string
  avatar?: string
  role: MemberRole
  status: MemberStatus
  joined: string
}

type Table4Meta = {
  removeMember: (id: string) => void
}

const optionalColumns: { key: string; label: string }[] = [
  { key: "email", label: "Email" },
  { key: "role", label: "Role" },
  { key: "status", label: "Status" },
  { key: "joined", label: "Joined" },
]

const roleFilters: { value: string; label: string }[] = [
  { value: "all", label: "Role" },
  { value: "Owner", label: "Owner" },
  { value: "Admin", label: "Admin" },
  { value: "Member", label: "Member" },
  { value: "Viewer", label: "Viewer" },
]

// shadcncraft ships its own Badge with hardcoded green/yellow variants; the
// preset Badge plus semantic tokens keeps status colours on-theme.
const statusBadgeClassName: Record<MemberStatus, string> = {
  Active: "border-success/25 bg-success/10 text-success",
  Offline: "",
  Invited: "border-warning/25 bg-warning/10 text-warning",
}

const globalFilterFn: FilterFn<Member> = (row, _columnId, filterValue) => {
  const search = String(filterValue).trim().toLowerCase()

  if (search === "") {
    return true
  }

  return (
    row.original.name.toLowerCase().includes(search) ||
    row.original.email.toLowerCase().includes(search)
  )
}

function getInitials(name: string) {
  const [first = "", second = ""] = name.trim().split(/\s+/)
  const initials = second
    ? first.charAt(0) + second.charAt(0)
    : first.slice(0, 2)
  return initials.toUpperCase()
}

const columns: ColumnDef<Member>[] = [
  {
    id: "drag",
    header: () => <span className="sr-only">Reorder</span>,
    cell: ({ row, table }) => (
      <RowDragHandle
        rowId={row.id}
        disabled={table.getState().sorting.length > 0}
      />
    ),
    meta: { width: "1%" },
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        className="mr-1"
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={
          table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()
        }
        onCheckedChange={(checked) =>
          table.toggleAllPageRowsSelected(checked === true)
        }
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        className="mr-1"
        checked={row.getIsSelected()}
        onCheckedChange={(checked) => row.toggleSelected(checked === true)}
      />
    ),
    meta: { width: "1%" },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Member",
    cell: ({ row }) => (
      <Item size="xs" className="flex-nowrap p-0">
        <ItemMedia className="self-center">
          <Avatar>
            <AvatarImage src={row.original.avatar} alt={row.original.name} />
            <AvatarFallback>{getInitials(row.original.name)}</AvatarFallback>
          </Avatar>
        </ItemMedia>
        <ItemContent className="gap-0">
          <ItemTitle>{row.original.name}</ItemTitle>
          <ItemDescription>{row.original.email}</ItemDescription>
        </ItemContent>
      </Item>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "email",
    header: "Email",
    enableSorting: false,
  },
  {
    accessorKey: "role",
    header: "Role",
    filterFn: "equalsString",
    enableSorting: false,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue<MemberStatus>("status")
      return (
        <Badge variant="outline" className={statusBadgeClassName[status]}>
          {status}
        </Badge>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: "joined",
    header: ({ column }) => (
      <ButtonSort
        sorted={column.getIsSorted()}
        onClick={() => column.toggleSorting()}
      >
        Joined
      </ButtonSort>
    ),
    cell: ({ row }) =>
      format(parseISO(row.getValue<string>("joined")), "MMM d, yyyy"),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row, table }) => (
      <div className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" size="icon-sm" />}
          >
            <span className="sr-only">Open row actions</span>
            <IconPlaceholder
              lucide="MoreHorizontalIcon"
              tabler="IconDots"
              hugeicons="MoreHorizontalIcon"
              phosphor="DotsThreeIcon"
              remixicon="RiMoreLine"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-fit" align="end">
            <DropdownMenuItem>View profile</DropdownMenuItem>
            <DropdownMenuItem>Copy email</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() =>
                (table.options.meta as Table4Meta).removeMember(row.original.id)
              }
            >
              Remove member
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
    meta: { width: 56 },
    enableSorting: false,
    enableHiding: false,
  },
]

export function Table4() {
  "use no memo"

  const [members, setMembers] = React.useState<Member[]>(membersData)
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  // Stable id so the DndContext markup matches between server and client.
  const sortableId = React.useId()

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setMembers((previous) => {
        const oldIndex = previous.findIndex((item) => item.id === active.id)
        const newIndex = previous.findIndex((item) => item.id === over.id)
        return arrayMove(previous, oldIndex, newIndex)
      })
      // Persist the new order here (e.g. send the reordered ids to your API).
    }
  }

  const table = useReactTable({
    data: members,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
      pagination,
    },
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    globalFilterFn,
    meta: {
      removeMember: (id: string) => {
        setMembers((previous) => previous.filter((item) => item.id !== id))
        setRowSelection((previous) => {
          if (!(id in previous)) {
            return previous
          }
          const next = { ...previous }
          delete next[id]
          return next
        })
      },
    } satisfies Table4Meta,
  })

  const roleFilter =
    (table.getColumn("role")?.getFilterValue() as string | undefined) ?? "all"
  const roleFilterLabel =
    roleFilters.find((filter) => filter.value === roleFilter)?.label ?? "Role"

  // Ids of the rendered rows, in display order, for SortableContext.
  const rowIds = table.getRowModel().rows.map((row) => row.id)

  return (
    <section className="flex flex-col gap-4 py-8">
      {/* Toolbar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex gap-2">
          <InputGroup className="sm:w-64">
            <InputGroupAddon>
              <IconPlaceholder
                lucide="Search"
                tabler="IconSearch"
                hugeicons="SearchIcon"
                phosphor="MagnifyingGlassIcon"
                remixicon="RiSearchLine"
              />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Filter members..."
              value={globalFilter}
              onChange={(e) => table.setGlobalFilter(String(e.target.value))}
            />
          </InputGroup>

          <Button className="sm:hidden">Invite member</Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" />}>
              {roleFilterLabel}
              <IconPlaceholder
                lucide="ChevronDownIcon"
                tabler="IconChevronDown"
                hugeicons="ArrowDown01Icon"
                phosphor="CaretDownIcon"
                remixicon="RiArrowDownSLine"
              />
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-fit" align="end">
              <DropdownMenuRadioGroup
                value={roleFilter}
                onValueChange={(value) =>
                  table
                    .getColumn("role")
                    ?.setFilterValue(value === "all" ? undefined : value)
                }
              >
                {roleFilters.map((filter) => (
                  <DropdownMenuRadioItem
                    key={filter.value}
                    value={filter.value}
                  >
                    {filter.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" />}>
              Columns
              <IconPlaceholder
                lucide="ChevronDownIcon"
                tabler="IconChevronDown"
                hugeicons="ArrowDown01Icon"
                phosphor="CaretDownIcon"
                remixicon="RiArrowDownSLine"
              />
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-fit" align="end">
              {optionalColumns.map((column) => {
                const tableColumn = table.getColumn(column.key)

                if (!tableColumn) {
                  return null
                }

                return (
                  <DropdownMenuCheckboxItem
                    key={column.key}
                    checked={tableColumn.getIsVisible()}
                    onCheckedChange={(checked) =>
                      tableColumn.toggleVisibility(checked === true)
                    }
                  >
                    {column.label}
                  </DropdownMenuCheckboxItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button className="max-sm:hidden">Invite member</Button>
        </div>
      </div>

      {/* Table */}
      <DndContext
        id={sortableId}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        sensors={sensors}
        onDragEnd={handleDragEnd}
      >
        <div className="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      aria-sort={getAriaSort(header.column)}
                      className="first:pl-4 last:pr-4"
                      style={{ width: header.column.columnDef.meta?.width }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {table.getRowModel().rows.length > 0 ? (
                <SortableContext
                  items={rowIds}
                  strategy={verticalListSortingStrategy}
                >
                  {table.getRowModel().rows.map((row) => (
                    <DraggableRow key={row.id} row={row} />
                  ))}
                </SortableContext>
              ) : (
                <TableRow className="hover:bg-inherit">
                  <TableCell
                    colSpan={table.getVisibleLeafColumns().length}
                    className="p-0"
                  >
                    <Empty className="py-16">
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <IconPlaceholder
                            lucide="Search"
                            tabler="IconSearch"
                            hugeicons="SearchIcon"
                            phosphor="MagnifyingGlassIcon"
                            remixicon="RiSearchLine"
                          />
                        </EmptyMedia>
                        <EmptyTitle>No members found</EmptyTitle>
                        <EmptyDescription>
                          Your search or filters did not match any members.
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </DndContext>

      {/* Pagination */}
      <DataTablePagination table={table}>
        <DataTablePaginationInfo className="max-sm:hidden" />

        <DataTablePaginationControls className="max-sm:justify-between">
          <DataTablePaginationPageSize className="max-sm:hidden" />
          <DataTablePaginationPageInfo />
          <DataTablePaginationButtons />
        </DataTablePaginationControls>
      </DataTablePagination>
    </section>
  )
}

function RowDragHandle({
  rowId,
  disabled,
}: {
  rowId: string
  disabled?: boolean
}) {
  const { attributes, listeners } = useSortable({ id: rowId, disabled })

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      className="cursor-grab text-muted-foreground active:cursor-grabbing"
      disabled={disabled}
      {...attributes}
      {...listeners}
    >
      <span className="sr-only">Drag to reorder</span>
      <IconPlaceholder
        lucide="GripVerticalIcon"
        tabler="IconGripVertical"
        hugeicons="DragDropVerticalIcon"
        phosphor="DotsSixVerticalIcon"
        remixicon="RiDraggable"
      />
    </Button>
  )
}

function DraggableRow({ row }: { row: Row<Member> }) {
  "use no memo"

  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.id,
  })

  return (
    <TableRow
      ref={setNodeRef}
      data-dragging={isDragging}
      data-state={row.getIsSelected() && "selected"}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id} className="first:pl-4 last:pr-4">
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  )
}

function getAriaSort(
  column: Column<Member>
): React.AriaAttributes["aria-sort"] {
  if (!column.getCanSort()) {
    return undefined
  }

  const sorted = column.getIsSorted()
  return sorted === "asc"
    ? "ascending"
    : sorted === "desc"
      ? "descending"
      : "none"
}

function ButtonSort({
  className,
  children,
  align = "left",
  sorted = false,
  ...props
}: React.ComponentProps<typeof Button> & {
  align?: "left" | "right"
  sorted?: false | SortDirection
}) {
  return (
    <div data-align={align} className="data-[align=right]:text-right">
      <Button
        className={cn(
          "px-2 data-[align=left]:-translate-x-2 data-[align=right]:translate-x-2",
          className
        )}
        variant="ghost"
        data-align={align}
        data-sorted={sorted || undefined}
        {...props}
      >
        {children}
        {sorted === "asc" ? (
          <IconPlaceholder
            lucide="ArrowUpIcon"
            tabler="IconArrowUp"
            hugeicons="ArrowUpIcon"
            phosphor="ArrowUpIcon"
            remixicon="RiArrowUpLine"
          />
        ) : sorted === "desc" ? (
          <IconPlaceholder
            lucide="ArrowDownIcon"
            tabler="IconArrowDown"
            hugeicons="ArrowDownIcon"
            phosphor="ArrowDownIcon"
            remixicon="RiArrowDownLine"
          />
        ) : (
          <IconPlaceholder
            lucide="ArrowUpDownIcon"
            hugeicons="ArrowUpDownIcon"
            tabler="IconArrowsSort"
            phosphor="ArrowsDownUpIcon"
            remixicon="RiArrowUpDownLine"
          />
        )}
      </Button>
    </div>
  )
}

const membersData: Member[] = [
  {
    id: "amelia-chen",
    name: "Amelia Chen",
    email: "amelia@shadcncraft.com",
    avatar: "https://assets.shadcncraft.com/registry/avatars/person-1.webp",
    role: "Owner",
    status: "Active",
    joined: "2024-01-08",
  },
  {
    id: "chanh-dai",
    name: "Chanh Dai",
    email: "dai@shadcncraft.com",
    avatar: "https://assets.shadcncraft.com/registry/avatars/person-2.webp",
    role: "Admin",
    status: "Active",
    joined: "2024-03-22",
  },
  {
    id: "hamish-oneill",
    name: "Hamish O’Neill",
    email: "hamish@shadcncraft.com",
    avatar: "https://assets.shadcncraft.com/registry/avatars/person-4.webp",
    role: "Admin",
    status: "Active",
    joined: "2024-01-08",
  },
  {
    id: "lena-pinot",
    name: "Léna Pinot",
    email: "lena@swile.co",
    avatar: "https://assets.shadcncraft.com/registry/avatars/person-7.webp",
    role: "Member",
    status: "Active",
    joined: "2025-09-14",
  },
  {
    id: "marcus-webb",
    name: "Marcus Webb",
    email: "marcus@webbdesign.io",
    avatar: "https://assets.shadcncraft.com/registry/avatars/person-5.webp",
    role: "Member",
    status: "Offline",
    joined: "2025-11-30",
  },
  {
    id: "priya-sharma",
    name: "Priya Sharma",
    email: "priya.s@fernhill.design",
    avatar: "https://assets.shadcncraft.com/registry/avatars/person-6.webp",
    role: "Member",
    status: "Active",
    joined: "2026-02-17",
  },
  {
    id: "tom-okafor",
    name: "Tom Okafor",
    email: "tom@quill.dev",
    role: "Viewer",
    status: "Invited",
    joined: "2026-06-29",
  },
  {
    id: "sofia-reyes",
    name: "Sofia Reyes",
    email: "sofia@lumen.co",
    avatar: "https://assets.shadcncraft.com/registry/avatars/person-3.webp",
    role: "Member",
    status: "Invited",
    joined: "2026-07-01",
  },
  {
    id: "mei-tanaka",
    name: "Mei Tanaka",
    email: "mei@shadcncraft.com",
    role: "Admin",
    status: "Active",
    joined: "2024-04-14",
  },
  {
    id: "jonas-weber",
    name: "Jonas Weber",
    email: "jonas@cobaltsys.com",
    role: "Member",
    status: "Active",
    joined: "2025-08-21",
  },
  {
    id: "aisha-bello",
    name: "Aisha Bello",
    email: "aisha@lumen.co",
    role: "Member",
    status: "Offline",
    joined: "2025-10-03",
  },
  {
    id: "owen-gallagher",
    name: "Owen Gallagher",
    email: "owen@quill.dev",
    role: "Viewer",
    status: "Invited",
    joined: "2025-12-05",
  },
  {
    id: "carlos-ibarra",
    name: "Carlos Ibarra",
    email: "carlos@swile.co",
    role: "Member",
    status: "Active",
    joined: "2026-05-09",
  },
  {
    id: "freya-lindqvist",
    name: "Freya Lindqvist",
    email: "freya@webbdesign.io",
    role: "Member",
    status: "Invited",
    joined: "2026-06-02",
  },
]
