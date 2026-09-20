"use client"

import * as React from "react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/cn-ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/cn-ui/sidebar"
import { IconPlaceholder } from "@/components/icon-placeholder"

export type Team = {
  name: string
  plan: string
  /** Rendered icon, not the component: `IconPlaceholder` resolves as JSX. */
  logo: React.ReactNode
}

/** ⌘0 is not a thing, so the tenth workspace onwards gets no shortcut. */
const SHORTCUT_LIMIT = 9

export function TeamSwitcher({ teams }: { teams: Team[] }) {
  const [activeTeam, setActiveTeam] = React.useState(teams[0])

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      // The menu prints ⌘ only, so this check and that label change together.
      if (!event.metaKey && !event.ctrlKey) {
        return
      }

      if (event.altKey || event.shiftKey) {
        return
      }

      // `code`, not `key`: on a French layout the top row needs Shift, so `key`
      // reports "&" for the key printed 1.
      const position = Number(event.code.match(/^Digit([1-9])$/)?.[1])
      if (!position || position > Math.min(teams.length, SHORTCUT_LIMIT)) {
        return
      }

      // A modifier combination, so it needs no "are we in a text field" guard.
      event.preventDefault()
      setActiveTeam(teams[position - 1])
    }

    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [teams])

  if (!activeTeam) {
    return null
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="aria-expanded:bg-sidebar-accent"
              />
            }
          >
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              {activeTeam.logo}
            </div>
            <div className="grid flex-1 text-left leading-tight">
              <span className="truncate font-medium">{activeTeam.name}</span>
              <span className="truncate text-xs">{activeTeam.plan}</span>
            </div>
            <IconPlaceholder
              lucide="ChevronsUpDown"
              tabler="IconSelector"
              hugeicons="UnfoldMoreIcon"
              phosphor="CaretUpDownIcon"
              remixicon="RiExpandUpDownLine"
              className="ml-auto"
            />
          </DropdownMenuTrigger>

          <DropdownMenuContent className="min-w-56" side="bottom" align="start">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
              {teams.map((team, index) => (
                <DropdownMenuItem
                  key={team.name}
                  onClick={() => setActiveTeam(team)}
                >
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg border">
                    {team.logo}
                  </div>
                  {team.name}
                  {index < SHORTCUT_LIMIT ? (
                    <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                  ) : null}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <div className="flex aspect-square size-8 items-center justify-center">
                  <IconPlaceholder
                    lucide="Plus"
                    tabler="IconPlus"
                    hugeicons="PlusSignIcon"
                    phosphor="PlusIcon"
                    remixicon="RiAddLine"
                  />
                </div>
                Add workspace
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
