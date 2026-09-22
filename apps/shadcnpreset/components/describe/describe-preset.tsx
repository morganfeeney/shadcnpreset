"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { DEFAULT_PRESET_CONFIG, encodePreset } from "shadcn/preset"
import { ArrowRightIcon, SparkleIcon } from "@phosphor-icons/react"

import { PresetLiveHero } from "@/app/(preset)/preset/components"
import { PresetV4Frame } from "@/components/preset-v4-frame"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Spinner } from "@/components/ui/spinner"
import { Container } from "@/components/zippystarter/container"
import type { JevPresetReading } from "@/lib/jev-presets/read-preset"
import { getPresetPreviewUrl } from "@/lib/preset"
import { cn } from "@/lib/utils"

type DescribeResult = JevPresetReading & { model: string; ms: number }

/**
 * Waits out the pauses inside a sentence, so the preview changes once per
 * thought rather than once per word.
 */
const DEBOUNCE_MS = 500
const MIN_LENGTH = 3

/**
 * The frame loads once, on the default preset, while the visitor is still
 * typing. Every result after that is posted into it, so none waits on a load.
 */
const FRAME_SRC = getPresetPreviewUrl(encodePreset(DEFAULT_PRESET_CONFIG))

/** Short to fit the sidebar; each fills in a fuller description for Jev. */
const IDEAS = [
  { label: "Dark fintech", description: "dark fintech dashboard" },
  { label: "Kids app", description: "playful pink app for kids" },
  { label: "Newspaper", description: "old fashioned newspaper" },
  { label: "Brutalist", description: "brutalist, sharp, black and white" },
  { label: "Cosy café", description: "cosy coffee shop" },
  { label: "Cyberpunk", description: "cyberpunk gaming" },
]

function useDebounced(value: string, ms: number) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), ms)
    return () => window.clearTimeout(id)
  }, [value, ms])
  return debounced
}

async function fetchDescribedPreset(
  description: string,
  signal: AbortSignal
): Promise<DescribeResult> {
  const response = await fetch("/api/jev/preset", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ description }),
    signal,
  })
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string
    } | null
    throw new Error(body?.error ?? "Something went wrong.")
  }
  return (await response.json()) as DescribeResult
}

/**
 * The preset page's layout — hero, toolbar, sidebar, preview pane — with the
 * sidebar holding the description instead of preset lists.
 *
 * Results live in component state only: the URL and history stay put, and the
 * shadcn create preview is re-themed by message rather than reloaded, so the
 * only wait is Jev itself.
 */
export function DescribePreset() {
  const [input, setInput] = useState("")
  const description = useDebounced(input.trim(), DEBOUNCE_MS)
  const ready = description.length >= MIN_LENGTH

  const result = useQuery({
    queryKey: ["describe-preset", description.toLowerCase()],
    queryFn: ({ signal }) => fetchDescribedPreset(description, signal),
    enabled: ready,
    // Hold the last preset on screen while the next one is on its way.
    placeholderData: keepPreviousData,
    // The same words always read the same way: repeats are instant.
    staleTime: Infinity,
    retry: false,
  })

  const data = ready ? result.data : undefined
  const busy = ready && result.isFetching
  const [frameLoaded, setFrameLoaded] = useState(false)

  return (
    <div className="w-full">
      <main className="grid gap-2">
        <Container aria-label="Preset details and actions" className="max-w-full">
          {data ? (
            <PresetLiveHero
              initialCode={data.code}
              initialDescription=""
              sharePath={`/preset/${data.code}`}
            />
          ) : (
            <div className="grid gap-1 py-6">
              <h1 className="text-2xl tracking-tight text-foreground">
                Describe a preset with Jev
              </h1>
              <p className="text-sm text-muted-foreground">
                Say what you want it to feel like. The preset updates as you
                type.
              </p>
            </div>
          )}
        </Container>

        <Container className="grid max-w-full gap-4">
          <div className="flex min-h-8 items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground tabular-nums">
              {busy
                ? "Reading…"
                : data
                  ? `Built by ${data.model} in ${data.ms} ms`
                  : "Built live by Jev"}
            </p>
            {data ? (
              <Button
                nativeButton={false}
                render={<Link href={`/preset/${data.code}`} />}
                variant="outline"
                size="sm"
              >
                Open preset
                <ArrowRightIcon data-icon="inline-end" />
              </Button>
            ) : null}
          </div>

          <div className="flex min-h-0 flex-col items-stretch gap-4 md:flex-row">
            <aside className="flex w-full shrink-0 flex-col overflow-hidden rounded-lg border bg-sidebar text-sidebar-foreground md:h-[calc(100dvh-14rem)] md:max-h-[calc(100dvh-14rem)] md:w-80 md:self-start">
              <div className="shrink-0 border-b p-2">
                <InputGroup className="h-9 bg-background">
                  <InputGroupAddon>
                    <SparkleIcon aria-hidden />
                  </InputGroupAddon>
                  <InputGroupInput
                    autoFocus
                    aria-label="Describe a look"
                    maxLength={300}
                    placeholder="Describe a look…"
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                  />
                  {busy ? (
                    <InputGroupAddon align="inline-end">
                      <Spinner />
                    </InputGroupAddon>
                  ) : null}
                </InputGroup>
                <ul aria-label="Ideas" className="flex flex-wrap gap-1.5 pt-2">
                  {IDEAS.map((idea) => (
                    <li key={idea.label}>
                      <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        onClick={() => setInput(idea.description)}
                      >
                        {idea.label}
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-3">
                {result.isError && ready ? (
                  <p className="pb-3 text-sm text-destructive" role="alert">
                    {result.error.message}
                  </p>
                ) : null}
                {data ? (
                  <JevReading result={data} />
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Describe a mood, brand or audience, or pick an idea above.
                    What Jev reads from it shows up here.
                  </p>
                )}
              </div>
            </aside>

            <div className="relative h-[70dvh] min-w-0 flex-1 overflow-hidden rounded-lg md:h-auto md:min-h-[calc(100dvh-14rem)]">
              {FRAME_SRC ? (
                <PresetV4Frame
                  className={cn(
                    "block h-full w-full border-0 transition-opacity md:min-h-[calc(100dvh-14rem)]",
                    busy && "opacity-60"
                  )}
                  src={FRAME_SRC}
                  title={
                    data ? `Preset preview ${data.code}` : "Preset preview"
                  }
                  livePreset={data?.code}
                  onLoad={() => setFrameLoaded(true)}
                />
              ) : null}
              {!data ? (
                <Empty className="absolute inset-0 border bg-background">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <SparkleIcon />
                    </EmptyMedia>
                    <EmptyTitle>Your preset appears here</EmptyTitle>
                    <EmptyDescription>
                      Mood, brand, audience or specifics — describe it in the
                      sidebar.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : !frameLoaded ? (
                <div className="absolute inset-0 flex items-center justify-center bg-background">
                  <Spinner />
                </div>
              ) : null}
            </div>
          </div>
        </Container>
      </main>
    </div>
  )
}

function JevReading({ result }: { result: DescribeResult }) {
  return (
    <div className="grid gap-3">
      <p className="text-xs font-medium text-muted-foreground">
        What Jev heard
      </p>
      <ul className="grid gap-2.5">
        {result.fields.map((field) => (
          <li key={field.field} className="grid gap-1">
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="text-muted-foreground">{field.label}</span>
              <span className="flex items-center gap-1.5">
                <span className="font-medium">{field.value}</span>
                <Badge
                  variant={
                    field.source === "typed"
                      ? "default"
                      : field.source === "asked"
                        ? "secondary"
                        : "outline"
                  }
                >
                  {field.source}
                </Badge>
              </span>
            </div>
            <div
              className="h-1 overflow-hidden rounded-full bg-muted"
              role="meter"
              aria-label={`${field.label} likelihood`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(field.probability * 100)}
            >
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${Math.round(field.probability * 100)}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
