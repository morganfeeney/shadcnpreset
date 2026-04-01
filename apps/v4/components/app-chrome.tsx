"use client"

import type { ReactNode } from "react"
import { usePathname, useSearchParams } from "next/navigation"

function isEmbedSearchParam(value: string | null): boolean {
  return value === "1" || value === "true"
}

type AppChromeProps = {
  children: ReactNode
  /** Rendered on the server — do not import SiteHeader here (it pulls Node-only doc source). */
  header: ReactNode
  footer: ReactNode
}

/**
 * Hides global marketing chrome when the create page is loaded in an iframe
 * with ?embed=1 (e.g. shadcnpreset preset preview).
 */
export function AppChrome({ children, header, footer }: AppChromeProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const embed = isEmbedSearchParam(searchParams.get("embed"))
  const hideOuterChrome = pathname === "/create" && embed

  return (
    <div
      data-slot="layout"
      className="group/layout relative z-10 flex min-h-svh flex-col bg-background has-data-[slot=designer]:h-svh has-data-[slot=designer]:overflow-hidden"
    >
      {!hideOuterChrome && header}
      <main className="flex min-h-0 flex-1 flex-col">{children}</main>
      {!hideOuterChrome && footer}
    </div>
  )
}
