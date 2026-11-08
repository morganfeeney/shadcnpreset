import { query } from "@/lib/db"

/**
 * One more install of a preset's custom colours today: the shadcn CLI
 * fetching its registry link, which no page sees. Only the preset and the
 * day are kept, nothing about who.
 */
export async function countInstall(presetCode: string) {
  await query(
    `
    INSERT INTO install_counts (preset_code, day, installs)
    VALUES ($1, CURRENT_DATE, 1)
    ON CONFLICT (preset_code, day)
    DO UPDATE SET installs = install_counts.installs + 1
    `,
    [presetCode]
  )
}

/**
 * Counts an install without ever failing one: a count that can't be kept
 * (say, the table not made yet) is logged and let go. Only the shadcn CLI,
 * which names itself, counts: a browser opening the link, a chat app's link
 * preview or a crawler isn't an install.
 */
export async function countInstallQuietly(
  request: Request,
  presetCode: string
) {
  const agent = request.headers.get("user-agent") ?? ""
  if (!/^shadcn\b/i.test(agent)) return
  try {
    await countInstall(presetCode)
  } catch (error) {
    console.error("[install-counts]", error)
  }
}
