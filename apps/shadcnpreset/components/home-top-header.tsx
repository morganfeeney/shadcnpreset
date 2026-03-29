import Link from "next/link"

import { PresetForm } from "@/components/preset-form"

export function HomeTopHeader() {
  return (
    <header className="rounded-2xl border bg-card/60 p-4 md:p-6">
      <div className="mx-auto grid max-w-4xl gap-4 text-center">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          shadcnpreset
        </p>
        <h1 className="text-2xl font-semibold tracking-tight md:text-4xl">
          Discover and apply great presets in seconds
        </h1>
        <p className="text-sm text-muted-foreground md:text-base">
          Curated picks up top, plus smart/code search directly on home.
        </p>
        <div className="mx-auto w-full max-w-2xl">
          <PresetForm />
        </div>
        <div className="flex items-center justify-center gap-2">
          <Link
            href="/?mode=smart&query=diverse+preset+mix"
            className="inline-flex h-8 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Explore presets
          </Link>
          <Link
            href="/create"
            className="inline-flex h-8 items-center justify-center rounded-md border bg-background px-3 text-sm font-medium transition-colors hover:bg-muted/50"
          >
            Open shadcn create
          </Link>
        </div>
      </div>
    </header>
  )
}
