import Link from "next/link"
import { notFound } from "next/navigation"
import { ExternalLink } from "lucide-react"

import { PresetV4Frame } from "@/components/preset-v4-frame"
import { PresetVoteButton } from "@/components/preset-vote-button"
import { getCanonicalPresetCode, resolvePresetFromCode } from "@/lib/preset"
import { Container } from "@/components/zippystarter/container"

type PresetPageProps = {
  params: Promise<{
    code: string
  }>
  searchParams: Promise<{
    embed?: string
  }>
}

export default async function PresetCodePage({
  params,
  searchParams,
}: PresetPageProps) {
  const { code } = await params
  const { embed } = await searchParams
  const preset = resolvePresetFromCode(code)

  if (!preset) {
    notFound()
  }

  const canonicalCode = getCanonicalPresetCode(preset)
  const v4BaseUrl = process.env.NEXT_PUBLIC_V4_URL ?? "http://localhost:4000"
  const createDirectUrl = new URL("/create", v4BaseUrl)
  createDirectUrl.searchParams.set("preset", code)
  const createIframeUrl = new URL(createDirectUrl.toString())
  createIframeUrl.searchParams.set("embed", "1")
  const previewUrl = new URL("/preview/radix/preview", v4BaseUrl)
  previewUrl.searchParams.set("preset", code)
  const isEmbedMode = embed === "1"

  if (isEmbedMode) {
    return (
      <main className="h-screen w-full overflow-hidden bg-background">
        <PresetV4Frame
          className="h-full min-h-0 w-full border-0"
          src={previewUrl.toString()}
          title={`v4 preview preset ${code} embed`}
        />
      </main>
    )
  }

  return (
    <main className="min-h-screen">
      <Container aria-label="Preset details and actions">
        <div className="inline-flex flex-wrap items-center gap-2">
          <h1 className="font-mono text-foreground">--preset {code}</h1>

          <PresetVoteButton code={canonicalCode} />
          <Link
            href={createDirectUrl.toString()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-7 shrink-0 items-center justify-center gap-1.5 rounded-[min(var(--radius-md),12px)] border border-transparent bg-secondary px-2.5 text-[0.8rem] font-medium text-secondary-foreground transition-colors outline-none hover:bg-secondary/80 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 [&_svg]:pointer-events-none [&_svg]:shrink-0"
          >
            Open in v4
            <ExternalLink className="size-3.5 opacity-80" aria-hidden />
          </Link>
        </div>
      </Container>
      <div className="overflow-hidden">
        <PresetV4Frame
          className="block h-[calc(100dvh-16rem)] min-h-[560px] w-full border-0"
          src={createIframeUrl.toString()}
          title={`v4 create preset ${code}`}
        />
      </div>
    </main>
  )
}
