"use client"

import * as React from "react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/cn-ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/cn-ui/sidebar"
import { IconPlaceholder } from "@/components/icon-placeholder"

export type Project = {
  name: string
  /** Rendered icon, not the component: `IconPlaceholder` resolves as JSX. */
  icon: React.ReactNode
}

/**
 * Hidden when the sidebar folds to icons: a list of project names has no icon
 * column to fold into.
 */
export function NavProjects({
  label,
  projects,
  onMore,
}: {
  label: string
  projects: Project[]
  onMore?: () => void
}) {
  const { isMobile } = useSidebar()

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>{label}</SidebarGroupLabel>

      <SidebarMenu>
        {projects.map((project) => (
          <SidebarMenuItem key={project.name}>
            <SidebarMenuButton>
              {project.icon}
              <span>{project.name}</span>
            </SidebarMenuButton>

            <DropdownMenu>
              <DropdownMenuTrigger render={<SidebarMenuAction showOnHover />}>
                <IconPlaceholder
                  lucide="MoreHorizontal"
                  tabler="IconDots"
                  hugeicons="MoreHorizontalCircle01Icon"
                  phosphor="DotsThreeIcon"
                  remixicon="RiMoreLine"
                />
                <span className="sr-only">More options for {project.name}</span>
              </DropdownMenuTrigger>

              {/* Inert: wire these to your own handlers. */}
              <DropdownMenuContent
                className="min-w-48"
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}
              >
                <DropdownMenuItem>
                  <IconPlaceholder
                    lucide="Folder"
                    tabler="IconFolder"
                    hugeicons="Folder01Icon"
                    phosphor="FolderIcon"
                    remixicon="RiFolderLine"
                  />
                  View project
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <IconPlaceholder
                    lucide="Share"
                    tabler="IconShare2"
                    hugeicons="Share03Icon"
                    phosphor="ExportIcon"
                    remixicon="RiShare2Line"
                  />
                  Share project
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">
                  <IconPlaceholder
                    lucide="Trash2"
                    tabler="IconTrash"
                    hugeicons="Delete02Icon"
                    phosphor="TrashIcon"
                    remixicon="RiDeleteBinLine"
                  />
                  Delete project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}

        <SidebarMenuItem>
          <SidebarMenuButton
            className="text-sidebar-foreground/70"
            onClick={onMore}
          >
            <IconPlaceholder
              lucide="MoreHorizontal"
              tabler="IconDots"
              hugeicons="MoreHorizontalCircle01Icon"
              phosphor="DotsThreeIcon"
              remixicon="RiMoreLine"
              className="text-sidebar-foreground/70"
            />
            <span>More</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}
