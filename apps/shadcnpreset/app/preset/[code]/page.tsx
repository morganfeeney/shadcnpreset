import { notFound } from "next/navigation"
import { encodePreset } from "shadcn/preset"

import { PresetV4Frame } from "@/components/preset-v4-frame"
import { Container } from "@/components/zippystarter/container"
import { resolvePresetFromCode } from "@/lib/preset"
import { PresetButtons, PresetCodeTitle } from "@/app/preset/[code]/components"

type PresetPageProps = {
  params: Promise<{
    code: string
  }>
  searchParams: Promise<{
    embed?: string
  }>
}

export default async function PresetCodePage({ params }: PresetPageProps) {
  const { code } = await params
  const preset = resolvePresetFromCode(code)

  if (!preset) {
    notFound()
  }

  const canonicalCode = encodePreset(preset)
  const v4BaseUrl = process.env.NEXT_PUBLIC_V4_URL ?? "http://localhost:4000"
  const createDirectUrl = new URL("/create", v4BaseUrl)
  createDirectUrl.searchParams.set("preset", code)
  const createIframeUrl = new URL(createDirectUrl.toString())
  createIframeUrl.searchParams.set("embed", "1")
  const previewUrl = new URL("/preview/radix/preview", v4BaseUrl)
  previewUrl.searchParams.set("preset", code)

  return (
    <main className="grid gap-2">
      <Container aria-label="Preset details and actions">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <PresetCodeTitle presetCode={code} />
          <div className="flex items-center gap-2">
            <PresetButtons preset={canonicalCode} />
          </div>
        </div>
      </Container>
      <PresetV4Frame
        className="-mx-2 block h-[calc(100dvh-100px)] w-[calc(100%+16px)] border-0"
        src={createIframeUrl.toString()}
        title={`v4 create preset ${code}`}
      />
    </main>
  )
}
