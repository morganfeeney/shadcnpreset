"use client"

import Link from "next/link"
import { Heart, Sparkles } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react"

import { useMounted } from "@/hooks/use-mounted"
import { getPresetSwatchPair } from "@/lib/oklch-swatch"
import type { PresetPageItem } from "@/lib/preset-catalog"
import { buttonVariants } from "@/components/ui/button"

type PresetCardProps = {
  item: PresetPageItem
}

const ICON_LIBRARY_TITLES: Record<string, string> = {
  lucide: "Lucide",
  tabler: "Tabler",
  hugeicons: "Hugeicons",
  phosphor: "Phosphor",
  remixicon: "Remix Icon",
}

const ICON_LIBRARY_LOGOS: Record<string, ReactNode> = {
  lucide: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-3.5">
      <path
        d="M14 12a4 4 0 0 0-8 0 8 8 0 1 0 16 0 11.97 11.97 0 0 0-4-8.944"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 12a4 4 0 0 0 8 0 8 8 0 1 0-16 0 11.97 11.97 0 0 0 4.063 9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  tabler: (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className="size-3.5">
      <path
        fill="currentColor"
        d="M31.288 7.107A8.83 8.83 0 0 0 24.893.712a55.9 55.9 0 0 0-17.786 0A8.83 8.83 0 0 0 .712 7.107a55.9 55.9 0 0 0 0 17.786 8.83 8.83 0 0 0 6.395 6.395c5.895.95 11.89.95 17.786 0a8.83 8.83 0 0 0 6.395-6.395c.95-5.895.95-11.89 0-17.786"
      />
      <path
        fill="white"
        d="m17.884 9.076 1.5-2.488 6.97 6.977-2.492 1.494zm-7.96 3.127 7.814-.909 3.91 3.66-.974 7.287-9.582 2.159a3.06 3.06 0 0 1-2.17-.329l5.244-4.897c.91.407 2.003.142 2.587-.626.584-.77.488-1.818-.226-2.484s-1.84-.755-2.664-.21c-.823.543-1.107 1.562-.67 2.412l-5.245 4.89a2.53 2.53 0 0 1-.339-2.017z"
      />
    </svg>
  ),
  hugeicons: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="size-3.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 9.5H22" />
      <path d="M20.5 9.5H3.5L4.23353 15.3682C4.59849 18.2879 4.78097 19.7477 5.77343 20.6239C6.76589 21.5 8.23708 21.5 11.1795 21.5H12.8205C15.7629 21.5 17.2341 21.5 18.2266 20.6239C19.219 19.7477 19.4015 18.2879 19.7665 15.3682L20.5 9.5Z" />
      <path d="M5 9C5 5.41015 8.13401 2.5 12 2.5C15.866 2.5 19 5.41015 19 9" />
    </svg>
  ),
  phosphor: (
    <svg viewBox="0 0 32 32" aria-hidden="true" className="size-3.5 fill-none">
      <path
        d="M9 5h9v16H9zm9 16v9a9 9 0 0 1-9-9M9 5l9 16m0 0h1a8 8 0 0 0 0-16h-1"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  remixicon: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="size-3.5">
      <path d="M12 2C17.5228 2 22 6.47715 22 12C22 15.3137 19.3137 18 16 18C12.6863 18 10 15.3137 10 12C10 11.4477 9.55228 11 9 11C8.44772 11 8 11.4477 8 12C8 16.4183 11.5817 20 16 20C16.8708 20 17.7084 19.8588 18.4932 19.6016C16.7458 21.0956 14.4792 22 12 22C6.6689 22 2.3127 17.8283 2.0166 12.5713C2.23647 9.45772 4.83048 7 8 7C11.3137 7 14 9.68629 14 13C14 13.5523 14.4477 14 15 14C15.5523 14 16 13.5523 16 13C16 8.58172 12.4183 5 8 5C6.50513 5 5.1062 5.41032 3.90918 6.12402C5.72712 3.62515 8.67334 2 12 2Z" />
    </svg>
  ),
}

export function PresetCard({ item }: PresetCardProps) {
  const { resolvedTheme } = useTheme()
  const mounted = useMounted()
  const isDark = mounted && resolvedTheme === "dark"
  const basePair = getPresetSwatchPair(item.config, "background")
  const themePair = getPresetSwatchPair(item.config, "primary")
  const chartPair = getPresetSwatchPair(item.config, "chart1")
  const chartPair2 = getPresetSwatchPair(item.config, "chart2")
  const chartPair3 = getPresetSwatchPair(item.config, "chart3")
  const iconLibrary = item.config.iconLibrary
  const iconLibraryTitle = ICON_LIBRARY_TITLES[iconLibrary] ?? iconLibrary
  const voteCountKey = useMemo(() => `preset-vote-count:${item.code}`, [item.code])
  const votedKey = useMemo(() => `preset-voted:${item.code}`, [item.code])
  const [voteCount, setVoteCount] = useState(0)
  const [hasVoted, setHasVoted] = useState(false)

  useEffect(() => {
    const storedCount = Number.parseInt(localStorage.getItem(voteCountKey) ?? "0", 10)
    setVoteCount(Number.isFinite(storedCount) ? storedCount : 0)
    setHasVoted(localStorage.getItem(votedKey) === "1")
  }, [voteCountKey, votedKey])

  function toggleVote() {
    setHasVoted((prev) => {
      const nextVoted = !prev
      const nextCount = Math.max(0, voteCount + (nextVoted ? 1 : -1))
      setVoteCount(nextCount)
      localStorage.setItem(votedKey, nextVoted ? "1" : "0")
      localStorage.setItem(voteCountKey, String(nextCount))
      return nextVoted
    })
  }

  const previewStyle = {
    "--preview-bg": isDark ? basePair.dark : basePair.light,
    "--preview-fg": isDark ? themePair.dark : themePair.light,
    "--preview-chart": isDark ? chartPair.dark : chartPair.light,
    "--preview-chart2": isDark ? chartPair2.dark : chartPair2.light,
    "--preview-chart3": isDark ? chartPair3.dark : chartPair3.light,
    "--preview-dot-theme": isDark ? themePair.dark : themePair.light,
    "--preview-dot-chart": isDark ? chartPair.dark : chartPair.light,
    "--preview-dot-base": isDark ? basePair.dark : basePair.light,
    "--preview-dot-chart2": isDark ? chartPair2.dark : chartPair2.light,
    "--preview-border":
      "color-mix(in oklch, var(--preview-fg), transparent 74%)",
    "--preview-muted":
      "color-mix(in oklch, var(--preview-bg), white 28%)",
  } as CSSProperties

  return (
    <li>
      <article
        style={previewStyle}
        className="group relative overflow-hidden rounded-xl border border-border/60 bg-background/50 backdrop-blur-sm transition-colors hover:border-border/80 hover:shadow-sm"
      >
        <div className="absolute top-3 right-3 z-10 flex gap-1">
          <span
            className="size-1.5 rounded-full border border-white/40 bg-(--preview-dot-theme)"
            title={`Theme: ${themePair.light} / ${themePair.dark}`}
          />
          <span
            className="size-1.5 rounded-full border border-white/40 bg-(--preview-dot-chart)"
            title={`Chart: ${chartPair.light} / ${chartPair.dark}`}
          />
          <span
            className="size-1.5 rounded-full border border-white/40 bg-(--preview-dot-base)"
            title={`Base: ${basePair.light} / ${basePair.dark}`}
          />
          <span
            className="size-1.5 rounded-full border border-white/40 bg-(--preview-dot-chart2)"
            title={`Theme dark: ${themePair.dark}`}
          />
        </div>

        <div className="relative h-40 overflow-hidden bg-(--preview-bg) text-(--preview-fg)">
          <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_100%_0%,color-mix(in_oklch,var(--preview-chart),transparent_74%)_0%,transparent_70%)]" />
          <div className="grid h-full grid-cols-2 gap-2 p-2">
            <section className="rounded-lg border border-(--preview-border) bg-black/15 p-2 shadow-sm">
              <p className="text-[10px] text-(--preview-muted)">
                Subscribe to updates
              </p>
              <div className="mt-1 h-5 rounded border border-(--preview-border) bg-black/20 px-1.5 text-[7px] leading-5 text-(--preview-muted)">
                Enter email
              </div>
              <div className="mt-1 h-4 rounded bg-(--preview-fg) px-2 text-[8px] leading-4 font-medium text-(--preview-bg)">
                Subscribe
              </div>
              <div className="mt-1.5 flex items-center gap-1 text-[8px] text-(--preview-muted)">
                <span className="size-2.5 rounded-[4px] border border-(--preview-border) bg-black/30" />
                Remember me
              </div>
            </section>

            <section className="rounded-lg border border-(--preview-border) bg-black/15 p-2 shadow-sm">
              <p className="text-[10px] text-(--preview-muted)">
                Subscriptions
              </p>
              <p className="text-xs font-semibold">+2,350</p>
              <p className="mt-0.5 text-[9px] text-(--preview-muted)">
                View More
              </p>
              <div className="mt-1.5 flex items-center justify-between gap-2">
                <svg viewBox="0 0 42 42" className="size-10 -rotate-90" aria-hidden="true">
                  <circle
                    cx="21"
                    cy="21"
                    r="15.9155"
                    fill="none"
                    strokeWidth="5"
                    className="stroke-[color-mix(in_oklch,var(--preview-chart),transparent_80%)]"
                  />
                  <circle
                    cx="21"
                    cy="21"
                    r="15.9155"
                    fill="none"
                    strokeWidth="5"
                    strokeDasharray="38 62"
                    strokeLinecap="butt"
                    className="stroke-[color-mix(in_oklch,var(--preview-chart),white_4%)]"
                  />
                  <circle
                    cx="21"
                    cy="21"
                    r="15.9155"
                    fill="none"
                    strokeWidth="5"
                    strokeDasharray="24 76"
                    strokeDashoffset="-42"
                    strokeLinecap="butt"
                    className="stroke-[color-mix(in_oklch,var(--preview-chart2),black_8%)]"
                  />
                  <circle
                    cx="21"
                    cy="21"
                    r="15.9155"
                    fill="none"
                    strokeWidth="5"
                    strokeDasharray="18 82"
                    strokeDashoffset="-70"
                    strokeLinecap="butt"
                    className="stroke-[color-mix(in_oklch,var(--preview-chart3),black_6%)]"
                  />
                </svg>
                <div className="min-w-0 flex-1">
                  <svg viewBox="0 0 120 40" className="h-10 w-full" aria-hidden="true">
                    <path
                      d="M2 30 C18 26, 30 14, 44 16 C57 18, 70 28, 84 24 C96 21, 106 13, 118 14 L118 39 L2 39 Z"
                      className="fill-[color-mix(in_oklch,var(--preview-chart),transparent_80%)]"
                    />
                    <path
                      d="M2 30 C18 26, 30 14, 44 16 C57 18, 70 28, 84 24 C96 21, 106 13, 118 14"
                      fill="none"
                      className="stroke-[color-mix(in_oklch,var(--preview-chart),white_3%)]"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="mt-1 space-y-1">
                    <div className="h-1.5 w-full rounded-full bg-[color-mix(in_oklch,var(--preview-chart),transparent_76%)]" />
                    <div className="h-1.5 w-5/6 rounded-full bg-[color-mix(in_oklch,var(--preview-chart),transparent_60%)]" />
                  </div>
                </div>
              </div>
            </section>

            <section className="col-span-2 rounded-lg border border-(--preview-border) bg-black/15 p-2 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  <span className="rounded-full bg-(--preview-fg)/15 px-1 py-0.5 text-[6px] font-medium">
                    New
                  </span>
                  <span className="rounded-full border border-(--preview-border) px-1 py-0.5 text-[6px]">
                    Beta
                  </span>
                </div>
                <span className="h-4 rounded bg-[color-mix(in_oklch,var(--preview-chart),transparent_10%)] px-2 text-[7px] leading-4 text-(--preview-bg)">
                  Settings
                </span>
              </div>
            </section>
          </div>

          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-black/5 to-black/25 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <div className="flex flex-col gap-2">
              <Link
                href={`/preset/${item.code}`}
                className={buttonVariants({ size: "sm", variant: "secondary" })}
              >
                Apply Theme
              </Link>
              <Link
                href={`${
                  process.env.NEXT_PUBLIC_V4_URL ?? "http://localhost:4000"
                }/create?preset=${item.code}`}
                target="_blank"
                className={buttonVariants({ size: "sm" })}
              >
                Open in Editor
              </Link>
            </div>
          </div>
        </div>

        <div className="space-y-3 bg-background/80 p-4">
          <div className="space-y-1">
            <h3 className="text-sm font-medium leading-tight text-foreground">{item.code}</h3>
            <p className="line-clamp-1 text-xs leading-relaxed text-muted-foreground">
              {`${item.config.style} style with ${item.config.theme} accents, ${iconLibraryTitle} icons, ${item.config.font} body font and ${item.config.radius} radius.`}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <button
                type="button"
                onClick={toggleVote}
                aria-pressed={hasVoted}
                className="inline-flex items-center gap-1 rounded-md px-1 py-0.5 transition-colors hover:bg-muted/70 hover:text-foreground"
              >
                <Heart
                  className={`size-3 ${
                    hasVoted ? "fill-rose-500 text-rose-500" : "text-muted-foreground"
                  }`}
                />
                <span>{voteCount}</span>
              </button>
              <div className="inline-flex items-center gap-1">
                <Sparkles className="size-3" />
                <span>{item.index + 1}</span>
              </div>
            </div>

            <div className="inline-flex items-center gap-1 rounded-md border border-border/70 bg-muted/40 px-2 py-1 text-[11px] text-foreground">
              <span className="text-muted-foreground">
                {ICON_LIBRARY_LOGOS[iconLibrary] ?? null}
              </span>
              <span>{iconLibraryTitle}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {[
              `style:${item.config.style}`,
              `base:${item.config.baseColor}`,
              `theme:${item.config.theme}`,
              `chart:${item.config.chartColor ?? "neutral"}`,
              `menu:${item.config.menuColor}`,
            ].map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border/80 bg-muted/20 px-2 py-0.5 text-[10px] text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </article>
    </li>
  )
}
