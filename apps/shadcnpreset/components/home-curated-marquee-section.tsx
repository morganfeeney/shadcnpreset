import Link from "next/link"

import type { PresetPageItem } from "@/lib/preset-catalog"

type HomeCuratedMarqueeSectionProps = {
  items: PresetPageItem[]
  totalCombinations: number
}

export function HomeCuratedMarqueeSection({
  items,
  totalCombinations,
}: HomeCuratedMarqueeSectionProps) {
  const marqueeTrack = [...items, ...items]

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold tracking-tight md:text-xl">
            Curated preview stream
          </h2>
          <p className="text-sm text-muted-foreground">
            A rotating strip of editor picks you can apply instantly.
          </p>
        </div>
        <Link
          href="/browse"
          className="inline-flex h-7 items-center justify-center rounded-[min(var(--radius-md),12px)] bg-secondary px-2.5 text-[0.8rem] font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
        >
          Browse all {totalCombinations.toLocaleString()}
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card/40">
        <ul className="preset-marquee-track flex min-w-max gap-3 p-3">
          {marqueeTrack.map((item, index) => (
            <li key={`${item.code}-${index}`}>
              <Link
                href={`/preset/${item.code}`}
                className="block min-w-52 rounded-lg border bg-background px-3 py-2 transition-colors hover:border-primary/60 hover:bg-muted/30"
              >
                <p className="truncate text-sm font-medium">{item.code}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.config.style} • {item.config.baseColor} • {item.config.theme}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
