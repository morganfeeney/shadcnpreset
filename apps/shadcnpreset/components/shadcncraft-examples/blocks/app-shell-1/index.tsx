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

        {/* `*:shrink-0`, as shadcncraft ships this shell in their own dashboard:
            cards are `overflow-hidden`, so as flex items their automatic minimum
            height is 0 and they would shrink to fit the frame and clip instead
            of scrolling. */}
        <div className="flex flex-1 flex-col gap-4 overflow-auto p-4 *:shrink-0">
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
