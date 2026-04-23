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
    <main className="grid gap-4">
      <PresetThemeExtractor defaultCode={defaultCode} />
    </main>
  )
}
