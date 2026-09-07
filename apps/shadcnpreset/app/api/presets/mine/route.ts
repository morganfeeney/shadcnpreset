import { NextResponse } from "next/server"

import { getSessionUser } from "@/lib/auth"
import {
  toPresetSidebarItem,
  type PresetSidebarItem,
} from "@/lib/preset-sidebar-item"
import { getVotedPresetsForUser } from "@/lib/user-votes"

export async function GET() {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({
      authenticated: false,
      items: [] as PresetSidebarItem[],
    })
  }

  const feedItems = await getVotedPresetsForUser(user.id)
  return NextResponse.json({
    authenticated: true,
    items: feedItems.map(toPresetSidebarItem),
  })
}
