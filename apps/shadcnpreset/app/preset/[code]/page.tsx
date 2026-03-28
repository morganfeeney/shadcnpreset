import Link from "next/link"
import { PresetV4Frame } from "@/components/preset-v4-frame"
import { getCanonicalPresetCode, resolvePresetFromCode } from "@/lib/preset"

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
    return (
      <main className="page-wrap">
        <section className="empty-state">
          <h1>Invalid preset code</h1>
          <p>
            The route segment <code>{code}</code> is not a valid shadcn preset.
            Try another code from the create page.
          </p>
          <Link href="/">Back to code input</Link>
        </section>
      </main>
    )
  }

  const canonicalCode = getCanonicalPresetCode(preset)
  const v4BaseUrl = process.env.NEXT_PUBLIC_V4_URL ?? "http://localhost:4000"
  const createUrl = new URL("/create", v4BaseUrl)
  createUrl.searchParams.set("preset", code)
  const previewUrl = new URL("/preview/radix/preview", v4BaseUrl)
  previewUrl.searchParams.set("preset", code)
  const isEmbedMode = embed === "1"

  if (isEmbedMode) {
    return (
      <main className="v4-embed-page">
        <PresetV4Frame
          className="v4-frame v4-frame-embed"
          src={previewUrl.toString()}
          title={`v4 preview preset ${code} embed`}
        />
      </main>
    )
  }

  return (
    <main className="page-wrap">
      <section className="empty-state v4-header">
        <p className="eyebrow">shadcnpreset</p>
        <h1>Preset {code}</h1>
        <p>
          Rendering the real v4 create page from <code>apps/v4/app/(create)</code>{" "}
          with your preset applied.
        </p>
        <p>
          Canonical code: <code>{canonicalCode}</code>
          {preset.isLegacyCode ? " (legacy v1 input)" : ""}
        </p>
        <p>
          <Link href={createUrl.toString()} target="_blank">
            Open v4 create page directly
          </Link>
        </p>
      </section>
      <section className="v4-frame-wrap">
        <PresetV4Frame
          className="v4-frame"
          src={createUrl.toString()}
          title={`v4 create preset ${code}`}
        />
      </section>
    </main>
  )
}
