"use client"

import * as React from "react"
import { SidebarSimpleIcon } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

/**
 * A workspace: panels either side of a main area, with a bar along the
 * bottom, as a media player lays out its library, its now-playing pane and
 * its controls. Panels collapse to a narrow rail on wide screens and open as
 * sheets on phones. Collapsing is a choice, so a page can keep them fixed.
 */

type WorkspaceSide = "start" | "end"
export type WorkspaceOpen = Record<WorkspaceSide, boolean>

type WorkspaceContextValue = {
  collapsible: boolean
  isMobile: boolean
  open: WorkspaceOpen
  openMobile: WorkspaceOpen
  setOpen: (side: WorkspaceSide, open: boolean) => void
  toggle: (side: WorkspaceSide) => void
}

const WorkspaceContext = React.createContext<WorkspaceContextValue | null>(
  null
)

function useWorkspace() {
  const context = React.useContext(WorkspaceContext)
  if (!context) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider.")
  }
  return context
}

const BOTH_OPEN: WorkspaceOpen = { start: true, end: true }
const NONE_OPEN: WorkspaceOpen = { start: false, end: false }

function WorkspaceProvider({
  defaultOpen = BOTH_OPEN,
  defaultOpenMobile = NONE_OPEN,
  open: openProp,
  onOpenChange,
  collapsible = true,
  className,
  style,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  defaultOpen?: WorkspaceOpen
  /** Which panels start open as sheets on phones; none, unless asked. */
  defaultOpenMobile?: WorkspaceOpen
  /** Which panels are open on wide screens, for a page that keeps it itself. */
  open?: WorkspaceOpen
  onOpenChange?: (open: WorkspaceOpen) => void
  /** Panels collapse to a rail; without it they stay open on wide screens. */
  collapsible?: boolean
}) {
  const isMobile = useIsMobile()
  const [ownOpen, setOwnOpen] = React.useState(defaultOpen)
  const given = openProp ?? ownOpen
  const open = collapsible ? given : BOTH_OPEN
  const [openMobile, setOpenMobile] = React.useState(defaultOpenMobile)

  const setOpen = React.useCallback(
    (side: WorkspaceSide, next: boolean) => {
      if (isMobile) {
        setOpenMobile((current) => ({ ...current, [side]: next }))
        return
      }
      if (!collapsible) return
      const value = { ...open, [side]: next }
      if (openProp === undefined) setOwnOpen(value)
      onOpenChange?.(value)
    },
    [collapsible, isMobile, onOpenChange, open, openProp]
  )

  const toggle = React.useCallback(
    (side: WorkspaceSide) =>
      setOpen(side, isMobile ? !openMobile[side] : !open[side]),
    [isMobile, open, openMobile, setOpen]
  )

  const value = React.useMemo<WorkspaceContextValue>(
    () => ({ collapsible, isMobile, open, openMobile, setOpen, toggle }),
    [collapsible, isMobile, open, openMobile, setOpen, toggle]
  )

  return (
    <WorkspaceContext.Provider value={value}>
      <div
        data-slot="workspace"
        className={cn("flex h-full min-h-0 flex-col", className)}
        style={
          {
            "--workspace-start-width": "300px",
            "--workspace-start-rail-width": "64px",
            "--workspace-end-width": "288px",
            "--workspace-end-rail-width": "64px",
            ...style,
          } as React.CSSProperties
        }
        {...props}
      >
        {children}
      </div>
    </WorkspaceContext.Provider>
  )
}

function WorkspaceBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="workspace-body"
      className={cn("flex min-h-0 flex-1", className)}
      {...props}
    />
  )
}

type WorkspacePanelContextValue = { side: WorkspaceSide; label: string }

const WorkspacePanelContext =
  React.createContext<WorkspacePanelContextValue | null>(null)

function WorkspacePanel({
  side,
  label,
  collapsible = "rail",
  className,
  style,
  children,
  ...props
}: React.ComponentProps<"aside"> & {
  side: WorkspaceSide
  /** Names the panel, for its landmark and its sheet on phones. */
  label: string
  /**
   * Collapsed, it shrinks to a rail (`WorkspacePanelRail`), or goes entirely
   * when something else, such as the bar, opens it again.
   */
  collapsible?: "rail" | "offcanvas"
}) {
  const { isMobile, open, openMobile, setOpen } = useWorkspace()
  const panel = React.useMemo(() => ({ side, label }), [side, label])

  if (isMobile) {
    return (
      <WorkspacePanelContext.Provider value={panel}>
        <Sheet
          open={openMobile[side]}
          onOpenChange={(next) => setOpen(side, next)}
        >
          {/* Its own `data-side` (left or right) places the sheet. */}
          <SheetContent
            data-slot="workspace-panel"
            data-state="expanded"
            side={side === "start" ? "left" : "right"}
            showCloseButton={false}
            className={cn("group/workspace-panel gap-0 p-0", className)}
          >
            <SheetTitle className="sr-only">{label}</SheetTitle>
            {children}
          </SheetContent>
        </Sheet>
      </WorkspacePanelContext.Provider>
    )
  }

  const expanded = open[side]
  return (
    <WorkspacePanelContext.Provider value={panel}>
      <aside
        aria-label={label}
        data-slot="workspace-panel"
        data-side={side}
        data-state={expanded ? "expanded" : "collapsed"}
        data-collapsible={collapsible}
        hidden={collapsible === "offcanvas" && !expanded}
        className={cn(
          "group/workspace-panel flex shrink-0 flex-col overflow-hidden bg-background",
          side === "start" ? "border-r" : "border-l",
          className
        )}
        style={{
          width: `var(--workspace-${side}-${expanded ? "width" : "rail-width"})`,
          ...style,
        }}
        {...props}
      >
        {children}
      </aside>
    </WorkspacePanelContext.Provider>
  )
}

function WorkspacePanelHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="workspace-panel-header"
      className={cn(
        "flex h-12 shrink-0 items-center gap-2 border-b px-3 group-data-[state=collapsed]/workspace-panel:hidden",
        className
      )}
      {...props}
    />
  )
}

/** A label, not a heading: the page's own headings stay its own. */
function WorkspacePanelTitle({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="workspace-panel-title"
      className={cn("min-w-0 flex-1 truncate text-sm font-semibold", className)}
      {...props}
    />
  )
}

function WorkspacePanelContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="workspace-panel-content"
      className={cn(
        "min-h-0 flex-1 overflow-y-auto overscroll-contain group-data-[state=collapsed]/workspace-panel:hidden",
        className
      )}
      {...props}
    />
  )
}

/** What a collapsed panel shows: its way back open and anything to glance at. */
function WorkspacePanelRail({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="workspace-panel-rail"
      className={cn(
        "hidden min-h-0 flex-1 flex-col items-center gap-2 overflow-y-auto overscroll-contain py-2 group-data-[state=collapsed]/workspace-panel:flex",
        className
      )}
      {...props}
    />
  )
}

/**
 * Opens and collapses a panel: the one it sits in, or the `side` given when
 * it sits elsewhere, such as the bar. Nothing to show where panels are fixed.
 */
function WorkspacePanelTrigger({
  side: sideProp,
  label: labelProp,
  className,
  children,
  onClick,
  ...props
}: React.ComponentProps<typeof Button> & {
  side?: WorkspaceSide
  label?: string
}) {
  const { collapsible, isMobile, open, openMobile, toggle } = useWorkspace()
  const panel = React.useContext(WorkspacePanelContext)
  const side = sideProp ?? panel?.side ?? "start"
  const label = labelProp ?? panel?.label ?? ""
  if (!collapsible && !isMobile) return null
  const expanded = isMobile ? openMobile[side] : open[side]

  return (
    <Button
      data-slot="workspace-panel-trigger"
      data-side={side}
      data-state={expanded ? "expanded" : "collapsed"}
      variant="ghost"
      size={children ? "sm" : "icon-sm"}
      aria-expanded={expanded}
      aria-label={children ? undefined : `${expanded ? "Collapse" : "Open"} ${label}`}
      className={className}
      onClick={(event) => {
        onClick?.(event)
        toggle(side)
      }}
      {...props}
    >
      {children ?? (
        <SidebarSimpleIcon className={cn(side === "end" && "-scale-x-100")} />
      )}
    </Button>
  )
}

function WorkspaceMain({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="workspace-main"
      className={cn("flex min-w-0 flex-1 flex-col", className)}
      {...props}
    />
  )
}

/** The bar over the main area. */
function WorkspaceToolbar({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="workspace-toolbar"
      className={cn(
        "flex h-12 shrink-0 items-center gap-2 border-b px-3",
        className
      )}
      {...props}
    />
  )
}

/**
 * The bar along the bottom: something to name at its start, controls between.
 * On a phone the start and end share a row, with the controls under them.
 */
function WorkspaceBar({ className, ...props }: React.ComponentProps<"footer">) {
  return (
    <footer
      data-slot="workspace-bar"
      className={cn(
        "grid min-h-14 shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 border-t bg-background px-3 py-2 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]",
        className
      )}
      {...props}
    />
  )
}

function WorkspaceBarStart({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="workspace-bar-start"
      className={cn("flex min-w-0 items-center gap-3", className)}
      {...props}
    />
  )
}

function WorkspaceBarCenter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="workspace-bar-center"
      className={cn(
        "col-span-2 row-start-2 flex min-w-0 items-center justify-center gap-2 md:col-span-1 md:row-start-auto",
        className
      )}
      {...props}
    />
  )
}

function WorkspaceBarEnd({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="workspace-bar-end"
      className={cn("flex min-w-0 items-center justify-end gap-1", className)}
      {...props}
    />
  )
}

export {
  useWorkspace,
  WorkspaceBar,
  WorkspaceBarCenter,
  WorkspaceBarEnd,
  WorkspaceBarStart,
  WorkspaceBody,
  WorkspaceMain,
  WorkspacePanel,
  WorkspacePanelContent,
  WorkspacePanelHeader,
  WorkspacePanelRail,
  WorkspacePanelTitle,
  WorkspacePanelTrigger,
  WorkspaceProvider,
  WorkspaceToolbar,
}
