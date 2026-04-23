import { encodePreset } from "shadcn/preset"

import { PresetThemeExtractor } from "@/components/preset-theme-extractor"

type PresetThemePageProps = {
  searchParams: Promise<{
    code?: string
  }>
}

export default async function PresetThemePage({
  searchParams,
}: PresetThemePageProps) {
  const { code } = await searchParams
  const defaultCode = code?.trim() || encodePreset({})

  return (
    <main className="container py-8 md:py-10">
      <div className="mb-6 space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Preset Theme CSS Extractor
        </h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Decode a shadcn preset code and generate copy-pasteable CSS custom
          properties for light and dark mode.
        </p>
      </div>

      <PresetThemeExtractor defaultCode={defaultCode} />
    </main>
  )
}
