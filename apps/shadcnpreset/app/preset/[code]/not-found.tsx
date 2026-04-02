"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function PresetNotFound() {
  const pathname = usePathname()
  const segment = pathname?.split("/").filter(Boolean).pop() ?? ""

  return (
    <main className="">
      <section className="mx-auto my-16 max-w-180 rounded-lg border border-border bg-card p-8 text-card-foreground">
        <h1 className="mt-1 font-heading text-2xl">Invalid preset code</h1>
        <p className="mt-2 text-muted-foreground">
          The route segment <code>{segment}</code> is not a valid shadcn preset.
          Try another code from the create page.
        </p>
        <p className="mt-4">
          <Link
            href="/"
            className="text-primary underline underline-offset-4 hover:text-primary/90"
          >
            Back to code input
          </Link>
        </p>
      </section>
    </main>
  )
}
