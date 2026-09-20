import * as React from "react"

import { AppShellHeader1 } from "@/components/shadcncraft-examples/blocks/app-shell-header-1"
import { AppSidebar } from "@/components/shadcncraft-examples/blocks/app-shell-1/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/cn-ui/sidebar"

/**
 * Expects to be given a height — `h-svh` on the page, or an already-sized
 * parent — because the sidebar and the content each scroll inside the shell
 * rather than growing the page.
 */
export function AppShell1({ children }: { children?: React.ReactNode }) {
  return (
    <SidebarProvider className="h-full min-h-0">
      <AppSidebar />

      <SidebarInset className="min-h-0 overflow-hidden">
        <AppShellHeader1 />

        <div className="flex flex-1 flex-col gap-4 overflow-auto p-4">
          {children ?? (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-sm text-muted-foreground">
                Your page renders here.
              </p>
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
