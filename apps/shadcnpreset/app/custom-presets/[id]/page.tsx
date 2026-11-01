import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { connection } from "next/server"

import { CustomPresetEditor } from "@/components/custom-presets/custom-preset-editor"
import { getSessionUser } from "@/lib/auth"
import { siteConfig } from "@/lib/config"
import { getCustomPreset } from "@/lib/custom-preset-store"

type CustomPresetPageProps = {
  params: Promise<{ id: string }>
}

// One person's preset behind an unguessable link: kept out of search.
export const metadata: Metadata = {
  title: "Your custom preset",
  robots: { index: false, follow: false },
}

export default async function CustomPresetPage({
  params,
}: CustomPresetPageProps) {
  await connection()
  const { id } = await params
  const [stored, user] = await Promise.all([
    getCustomPreset(id),
    getSessionUser(),
  ])
  if (!stored) notFound()

  return (
    <main className="min-w-0 flex-1 pt-6 px-safe pb-20 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <CustomPresetEditor
          id={stored.id}
          initialCode={stored.presetCode}
          colours={stored.colours}
          canEdit={user?.id === stored.userId}
          origin={siteConfig.url}
        />
      </div>
    </main>
  )
}
