import * as React from "react"

import { NavMain } from "@/components/shadcncraft-examples/blocks/app-shell-1/components/nav-main"
import { NavProjects } from "@/components/shadcncraft-examples/blocks/app-shell-1/components/nav-projects"
import { NavUser } from "@/components/shadcncraft-examples/blocks/app-shell-1/components/nav-user"
import { TeamSwitcher } from "@/components/shadcncraft-examples/blocks/app-shell-1/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/cn-ui/sidebar"
import { IconPlaceholder } from "@/components/icon-placeholder"

/** Sample data — the first thing to replace. */
const TEAMS = [
  {
    name: "Acme Inc.",
    plan: "Enterprise",
    logo: (
      <IconPlaceholder
        lucide="GalleryVerticalEndIcon"
        tabler="IconLayoutRows"
        hugeicons="LayoutBottomIcon"
        phosphor="RowsIcon"
        remixicon="RiLayoutBottomLine"
      />
    ),
  },
  {
    name: "Acme Labs",
    plan: "Pro",
    logo: (
      <IconPlaceholder
        lucide="FlaskConical"
        tabler="IconFlask"
        hugeicons="TestTube01Icon"
        phosphor="FlaskIcon"
        remixicon="RiFlaskLine"
      />
    ),
  },
  {
    name: "Personal",
    plan: "Free",
    logo: (
      <IconPlaceholder
        lucide="User"
        tabler="IconUser"
        hugeicons="UserIcon"
        phosphor="UserIcon"
        remixicon="RiUserLine"
      />
    ),
  },
]

const NAV_MAIN = [
  {
    title: "Playground",
    icon: (
      <IconPlaceholder
        lucide="SquareTerminal"
        tabler="IconTerminal2"
        hugeicons="ComputerTerminal01Icon"
        phosphor="TerminalWindowIcon"
        remixicon="RiTerminalBoxLine"
      />
    ),
    defaultOpen: true,
    items: ["History", "Starred", "Settings"],
  },
  {
    title: "Models",
    icon: (
      <IconPlaceholder
        lucide="Bot"
        tabler="IconRobot"
        hugeicons="BotIcon"
        phosphor="RobotIcon"
        remixicon="RiRobot2Line"
      />
    ),
    items: ["Genesis", "Explorer", "Quantum"],
  },
  {
    title: "Documentation",
    icon: (
      <IconPlaceholder
        lucide="BookOpen"
        tabler="IconBook"
        hugeicons="BookOpen01Icon"
        phosphor="BookOpenIcon"
        remixicon="RiBookOpenLine"
      />
    ),
    items: ["Introduction", "Get Started", "Tutorials", "Changelog"],
  },
  {
    title: "Settings",
    icon: (
      <IconPlaceholder
        lucide="Settings2"
        tabler="IconAdjustmentsHorizontal"
        hugeicons="Settings02Icon"
        phosphor="SlidersHorizontalIcon"
        remixicon="RiEqualizerLine"
      />
    ),
    items: ["General", "Team", "Billing", "Limits"],
  },
]

const PROJECTS = [
  {
    name: "Design Engineering",
    icon: (
      <IconPlaceholder
        lucide="Hash"
        tabler="IconHash"
        hugeicons="TagIcon"
        phosphor="HashIcon"
        remixicon="RiHashtag"
      />
    ),
  },
  {
    name: "Sales & Marketing",
    icon: (
      <IconPlaceholder
        lucide="ChartPie"
        tabler="IconChartPie"
        hugeicons="PieChartIcon"
        phosphor="ChartPieIcon"
        remixicon="RiPieChartLine"
      />
    ),
  },
  {
    name: "Travel",
    icon: (
      <IconPlaceholder
        lucide="Map"
        tabler="IconMap"
        hugeicons="MapsIcon"
        phosphor="MapTrifoldIcon"
        remixicon="RiMapLine"
      />
    ),
  },
]

const USER = {
  name: "shadcn",
  email: "m@example.com",
  avatar: "https://github.com/shadcn.png",
  initials: "CN",
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={TEAMS} />
      </SidebarHeader>

      <SidebarContent>
        <NavMain label="Platform" items={NAV_MAIN} />
        <NavProjects label="Projects" projects={PROJECTS} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={USER} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
