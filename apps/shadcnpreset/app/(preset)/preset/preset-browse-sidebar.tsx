"use client"

import dynamic from "next/dynamic"
import { useState } from "react"
import { HeartIcon, SidebarSimpleIcon, SparkleIcon } from "@phosphor-icons/react"

import { PresetRelatedList } from "@/components/preset-related-list"
import { MyVotesSignInPrompt } from "@/components/my-votes-sign-in-prompt"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMyPresets } from "@/hooks/use-my-presets"
import type { PresetSidebarItem } from "@/lib/preset-sidebar-item"
import type { ResolvedPreset } from "@/lib/preset"
import {
  parsePresetSidebarTab,
  type PresetSidebarTab,
} from "@/lib/preset-preview"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/stores/auth-store"

const AssistantEmbed = dynamic(
  () =>
    import("@/components/assistant/assistant-embed").then(
      (mod) => mod.AssistantEmbed
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center">
        <Spinner />
      </div>
    ),
  }
)

const PREVIEW_HEIGHT = "h-[calc(100dvh-14rem)] max-h-[calc(100dvh-14rem)]"
const MOBILE_SHEET_CLASS =
  "w-[min(100vw-1rem,20rem)] border-sidebar-border bg-sidebar p-0 text-sidebar-foreground [&>button]:text-sidebar-foreground"

type PresetBrowseSidebarProps = {
  resolved: ResolvedPreset
  communityItems: PresetSidebarItem[]
  tab: PresetSidebarTab
  onTabChange: (tab: PresetSidebarTab) => void
  askAiMounted: boolean
  onSelectPreset: (code: string) => void
  onAskAiApplied?: () => void
  className?: string
}

function YoursTabPanel({
  currentCode,
  onSelectPreset,
}: {
  currentCode: string
  onSelectPreset: (code: string) => void
}) {
  const authStatus = useAuthStore((state) => state.status)
  const myPresets = useMyPresets()
  const items = myPresets.data?.items ?? []

  if (authStatus === "unknown") {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (authStatus !== "authenticated") {
    return (
      <Empty className="h-full border-0">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HeartIcon />
          </EmptyMedia>
          <EmptyTitle>Your presets</EmptyTitle>
          <EmptyDescription>
            Sign in to see presets you have saved.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <MyVotesSignInPrompt />
        </EmptyContent>
      </Empty>
    )
  }

  if (myPresets.isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (myPresets.isError) {
    return (
      <p className="p-3 text-sm text-destructive" role="alert">
        Could not load your presets.
      </p>
    )
  }

  if (items.length === 0) {
    return (
      <Empty className="h-full border-0">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HeartIcon />
          </EmptyMedia>
          <EmptyTitle>No saved presets</EmptyTitle>
          <EmptyDescription>
            Vote for a preset and it will show up here.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <PresetRelatedList
      items={items}
      currentCode={currentCode}
      onSelectPreset={onSelectPreset}
    />
  )
}

function PresetBrowseSidebarBody({
  resolved,
  communityItems,
  tab,
  onTabChange,
  askAiMounted,
  onSelectPreset,
  onAskAiApplied,
  className,
}: PresetBrowseSidebarProps) {
  return (
    <Tabs
      value={tab}
      onValueChange={(next) => onTabChange(parsePresetSidebarTab(next))}
      className={cn("flex h-full min-h-0 flex-col gap-0", className)}
    >
      <div className="shrink-0 border-b p-2">
        <TabsList className="grid h-8 w-full grid-cols-3">
          <TabsTrigger value="community" className="px-1 text-xs">
            Community
          </TabsTrigger>
          <TabsTrigger value="yours" className="px-1 text-xs">
            Yours
          </TabsTrigger>
          <TabsTrigger value="ask-ai" className="px-1 text-xs">
            <SparkleIcon className="size-3.5" />
            Ask AI
          </TabsTrigger>
        </TabsList>
      </div>

      <div
        className={cn(
          "min-h-0 flex-1 overflow-y-auto",
          tab !== "community" && "hidden"
        )}
      >
        {communityItems.length ? (
          <PresetRelatedList
            items={communityItems}
            currentCode={resolved.code}
            onSelectPreset={onSelectPreset}
          />
        ) : (
          <Empty className="h-full border-0">
            <EmptyHeader>
              <EmptyTitle>No community presets</EmptyTitle>
              <EmptyDescription>
                Voted presets will appear here.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>

      <div
        className={cn(
          "min-h-0 flex-1 overflow-y-auto",
          tab !== "yours" && "hidden"
        )}
      >
        <YoursTabPanel
          currentCode={resolved.code}
          onSelectPreset={onSelectPreset}
        />
      </div>

      <div
        className={cn(
          "min-h-0 flex-1 overflow-hidden",
          tab !== "ask-ai" && "hidden"
        )}
      >
        {askAiMounted ? (
          <AssistantEmbed resolved={resolved} onApply={onAskAiApplied} />
        ) : null}
      </div>
    </Tabs>
  )
}

export function PresetBrowseSidebar(props: PresetBrowseSidebarProps) {
  return (
    <aside
      className={cn(
        "hidden w-80 shrink-0 overflow-hidden rounded-lg border bg-sidebar text-sidebar-foreground md:flex md:flex-col md:self-start",
        PREVIEW_HEIGHT,
        props.className
      )}
    >
      <PresetBrowseSidebarBody {...props} />
    </aside>
  )
}

export function PresetBrowseSidebarSheet({
  resolved,
  communityItems,
  tab,
  onTabChange,
  askAiMounted,
  onSelectPreset,
}: Omit<PresetBrowseSidebarProps, "className">) {
  const [open, setOpen] = useState(false)

  function selectAndClose(code: string) {
    onSelectPreset(code)
    setOpen(false)
  }

  function closeSheet() {
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2 md:hidden"
          />
        }
      >
        <SidebarSimpleIcon className="size-4" aria-hidden />
        Presets
      </SheetTrigger>
      <SheetContent side="left" className={cn(MOBILE_SHEET_CLASS, "gap-0")}>
        <SheetHeader className="sr-only">
          <SheetTitle>Community, your presets, and Ask AI</SheetTitle>
        </SheetHeader>
        <PresetBrowseSidebarBody
          resolved={resolved}
          communityItems={communityItems}
          tab={tab}
          onTabChange={onTabChange}
          askAiMounted={askAiMounted}
          onSelectPreset={selectAndClose}
          onAskAiApplied={closeSheet}
          className="h-full pt-10"
        />
      </SheetContent>
    </Sheet>
  )
}
