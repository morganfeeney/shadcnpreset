"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { SquarePen } from "lucide-react"
import { toast } from "sonner"

import { AssistantChatProvider } from "@/components/assistant/assistant-chat-context"
import { AssistantConversation } from "@/components/assistant/assistant-conversation"
import { AssistantPreviewCard } from "@/components/assistant/assistant-preview-card"
import { AssistantPromptComposer } from "@/components/assistant/assistant-prompt-composer"
import { ProWall } from "@/components/assistant/pro-wall"
import { CustomPresetOffer } from "@/components/assistant/custom-preset-offer"
import { CustomPresetPanel } from "@/components/assistant/custom-preset-panel"
import { useWorkspacePreset } from "@/components/assistant/use-workspace-preset"
import { PresetStyleOverviewCard } from "@/components/preset-style-overview-card"
import { RecentChatsList } from "@/components/assistant/recent-chats-list"
import { ShadcncraftAdCard } from "@/components/shadcncraft-ad-card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"
import {
  useAssistantChat,
  type EditedCustomPreset,
} from "@/components/assistant/use-assistant-chat"
import { useUrlChatId } from "@/components/assistant/use-url-chat-id"
import { trackEvent } from "@/lib/analytics-events"
import { assistantChatPath } from "@/lib/assistant-chat-path"
import { readBrandColours, type BrandColour } from "@/lib/brand-theme"
import { DEFAULT_CUSTOM_PRESET_BASE } from "@/lib/custom-preset"
import { presetBrowsePath } from "@/lib/preset-preview"
import { cn } from "@/lib/utils"

export function AssistantChat({
  /** The chat the URL names, or null on `/assistant`. */
  routeChatId,
}: {
  routeChatId: string | null
}) {
  const router = useRouter()
  const queryClient = useQueryClient()
  // A custom preset opens beside the conversation: on a wide screen the chats
  // fold away and the chat narrows to a column; narrower, it slides over.
  // While it is open, every message is a change to it.
  const workspace = useWorkspacePreset()
  const panelOpen = Boolean(workspace.id)
  const chat = useAssistantChat({
    initialChatId: routeChatId,
    customPresetId: workspace.id,
    // The panel shows what the edit saved: its editor starts again from it.
    onCustomPresetEdited: (preset) =>
      queryClient.setQueryData<EditedCustomPreset & { canEdit: boolean }>(
        ["customPreset", preset.id],
        (previous) => (previous ? { ...previous, ...preset } : previous)
      ),
    // The answer has made this page a conversation worth returning to, so it
    // gains an address. Replace, not push: nobody navigated here, the page
    // they were already on became the chat.
    onChatCreated: (chatId) =>
      router.replace(assistantChatPath(chatId), { scroll: false }),
  })
  const {
    activeChatId,
    chatLoadError,
    composerResetKey,
    deleteChat,
    error,
    hasInteracted,
    isChatHydrating,
    lastTurn,
    messages,
    onPromptSubmit,
    pending,
    pendingKind,
    proRequired,
    openChatFromRoute,
    sendContent,
  } = chat

  // A chat named in the URL arrives empty for a beat. Give it the conversation
  // layout straight away, so someone who followed a link to an existing chat
  // sees it loading rather than the new-chat hero flashing up first.
  const showsConversation = hasInteracted || isChatHydrating

  // The sponsored card follows a finished answer, the way an ad sits under a
  // reply rather than beside a question. It waits out the turn in flight so it
  // does not sit below a loading placeholder.
  const showsAd =
    hasInteracted &&
    !isChatHydrating &&
    !pending &&
    messages.some((m) => m.role === "assistant")

  // Someone who gave exact colours wants them used, which no preset can do,
  // so the custom preset offer takes the sponsored card's place. The latest
  // message naming any keeps it for the rest of that conversation: "bolder"
  // still means bolder in those colours. It builds on the preset the
  // assistant picked last, or the default before it has picked one.
  const customPreset = React.useMemo(() => {
    let source: { text: string; colours: BrandColour[] } | null = null
    for (let i = messages.length - 1; i >= 0 && !source; i--) {
      const m = messages[i]
      if (m.role !== "user") continue
      const colours = readBrandColours(m.content)
      if (colours.length) source = { text: m.content, colours }
    }
    if (!source) return null
    const picked = messages.findLast(
      (m) => m.role === "assistant" && m.kind === "presets"
    )
    const presetCode =
      (picked?.role === "assistant" && picked.kind === "presets"
        ? picked.presets[0]?.code
        : undefined) ?? DEFAULT_CUSTOM_PRESET_BASE
    return { ...source, presetCode }
  }, [messages])

  React.useEffect(() => {
    trackEvent("ai_assistant_open", { page_path: "/assistant" })
  }, [])

  const urlChatId = useUrlChatId()

  // Once a custom preset is opened, the card stays its way back in: colours
  // given while it was open were changes to it, not a new one to make. While
  // it is open, the panel stands in for the card.
  const [pinnedOffer, setPinnedOffer] =
    React.useState<typeof customPreset>(null)
  const offer = pinnedOffer ?? customPreset

  // Kept through the close, so the panel does not empty as it slides away.
  const [shownPresetId, setShownPresetId] = React.useState(workspace.id)
  if (workspace.id && workspace.id !== shownPresetId) {
    setShownPresetId(workspace.id)
  }

  // A link, a sidebar click and the browser's back button all arrive the same
  // way: as a new URL. The page stays mounted across those, so the chat has
  // to follow it. https://react.dev/learn/you-might-not-need-an-effect
  const [syncedChatId, setSyncedChatId] = React.useState(urlChatId)
  if (urlChatId !== syncedChatId) {
    setSyncedChatId(urlChatId)
    openChatFromRoute(urlChatId)
  }

  // A send that failed says so over the conversation rather than as a line of
  // text under it, which is easy to miss when the eye is on the composer.
  React.useEffect(() => {
    if (!error) return
    toast.error(error, { id: "assistant-send" })
  }, [error])

  // A URL naming a chat that will not open: say why, and navigate back. The
  // navigation is what clears the conversation.
  React.useEffect(() => {
    if (!chatLoadError) return
    toast.error(chatLoadError, { id: "assistant-chat-load" })
    router.replace(assistantChatPath(null), { scroll: false })
  }, [chatLoadError, router])

  // Deleting the chat being read leaves the URL pointing at nothing.
  async function removeChat(chatId: string) {
    const wasOpen = chatId === activeChatId || chatId === urlChatId
    await deleteChat(chatId)
    if (wasOpen) {
      router.replace(assistantChatPath(null), { scroll: false })
    }
  }

  // New chat is a link; the URL sync clears the conversation. A send belongs
  // to the chat on screen, so leaving mid-flight is refused rather than
  // landing its reply in another conversation.
  function onNewChatClick(event: React.MouseEvent<HTMLElement>) {
    if (pending) event.preventDefault()
  }

  return (
    <AssistantChatProvider value={{ ...chat, deleteChat: removeChat }}>
      <SidebarProvider className="h-full min-h-0 overflow-hidden">
        <div
          data-open={panelOpen || undefined}
          data-instant={workspace.instant || undefined}
          className={cn(
            "hidden shrink-0 overflow-hidden md:block md:w-(--sidebar-width)",
            "xl:data-open:w-0",
            WORKSPACE_MOTION
          )}
        >
          <Sidebar
            collapsible="none"
            className="hidden h-full border-r border-border/70 md:flex"
          >
            {/* Its own scroller: reaching either end stops here rather than
              handing the rest of the gesture to the conversation. */}
            <SidebarContent className="overscroll-contain">
              <SidebarGroup className="sticky top-0 z-10 bg-background">
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        render={<Link href={assistantChatPath(null)} />}
                        isActive={!activeChatId}
                        onClick={onNewChatClick}
                        aria-disabled={pending || undefined}
                      >
                        <SquarePen />
                        New chat
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
              <SidebarGroup>
                <SidebarGroupLabel>Your chats</SidebarGroupLabel>
                <SidebarGroupContent>
                  <RecentChatsList />
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
        </div>

        <div
          data-open={panelOpen || undefined}
          data-instant={workspace.instant || undefined}
          className={cn(
            "flex min-w-0 flex-1 flex-col md:pr-2",
            "xl:data-open:pr-0",
            WORKSPACE_MOTION
          )}
        >
          <div
            className={cn(
              "mx-auto flex h-full min-h-0 w-full flex-col rounded-lg border",
              // Nothing to scroll before the first turn, so the empty state
              // sits in the middle of the pane with the composer under it.
              showsConversation || "justify-center"
            )}
          >
            <div
              className={cn(
                showsConversation &&
                  "min-h-0 flex-1 overflow-y-auto overscroll-contain pt-10"
              )}
            >
              <div
                className={cn(
                  "text-center",
                  showsConversation ? "hidden" : "pt-0"
                )}
              >
                <h1 className="text-[32px] font-semibold tracking-tight text-balance">
                  Describe your ideal shadcn preset
                </h1>
              </div>

              {isChatHydrating ? <AssistantChatSkeleton /> : null}

              {hasInteracted && !isChatHydrating ? (
                <div className="mx-auto grid w-full max-w-4xl transition-all duration-300">
                  <AssistantConversation
                    messages={messages}
                    pending={pending}
                    pendingKind={pendingKind}
                    scrollLatestIntoView
                    renderPreview={(m) =>
                      m.preview.presetCode ? (
                        <AssistantPreviewCard
                          preview={m.preview}
                          openHref={presetBrowsePath(
                            m.preview.presetCode,
                            "generated",
                            "ask-ai",
                            activeChatId ?? undefined
                          )}
                        />
                      ) : (
                        <AssistantPreviewCard preview={m.preview} />
                      )
                    }
                    renderPresets={(m, i) => (
                      <ul className="mt-4 grid gap-4 @min-lg:grid-cols-2">
                        {m.presets.map((p, presetIndex) => (
                          <li key={`${i}-${presetIndex}-${p.code}`}>
                            <PresetStyleOverviewCard
                              code={p.code}
                              title={p.code}
                              description={p.description}
                            />
                          </li>
                        ))}
                      </ul>
                    )}
                  />
                </div>
              ) : null}

              {lastTurn?.phase === "gathering" &&
              lastTurn.followUpQuestions.length ? (
                <div className="mx-auto flex w-full max-w-4xl flex-col gap-2 p-4">
                  <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Quick replies
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {lastTurn.followUpQuestions.map((q) => (
                      <Button
                        key={q}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-auto max-w-full py-2 text-left text-xs whitespace-normal"
                        onClick={() => void sendContent(q)}
                        disabled={pending}
                      >
                        {q}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : null}

              {panelOpen ? null : showsAd && offer ? (
                <CustomPresetOffer
                  text={offer.text}
                  colours={offer.colours}
                  presetCode={offer.presetCode}
                  chatId={activeChatId}
                  openId={workspace.id}
                  onOpen={(id) => {
                    trackEvent("custom_preset_panel_open", {})
                    setPinnedOffer(offer)
                    workspace.open(id)
                  }}
                  className="mx-auto w-full max-w-4xl px-4 pb-4"
                />
              ) : showsAd ? (
                <ShadcncraftAdCard
                  placement="assistant-chat"
                  impressionKey={activeChatId ?? undefined}
                  // The conversation's own column, so the card starts on the
                  // same left edge as the replies. Its width is capped by the
                  // card itself, not by narrowing this wrapper — that would
                  // re-centre it away from the messages on a wide screen.
                  className="mx-auto w-full max-w-4xl px-4 pb-4"
                />
              ) : null}
            </div>

            {proRequired ? (
              <ProWall />
            ) : (
              <AssistantPromptComposer
                hasInteracted={showsConversation}
                pending={pending}
                disabled={isChatHydrating}
                resetKey={composerResetKey}
                onPromptSubmit={onPromptSubmit}
                placeholder={
                  panelOpen ? "Ask for changes to this preset…" : undefined
                }
              />
            )}
          </div>
        </div>

        <section
          aria-label="Custom preset"
          inert={!panelOpen}
          data-open={panelOpen || undefined}
          data-instant={workspace.instant || undefined}
          className={cn(
            // Narrower screens: over the chat, in from the right.
            "fixed inset-0 z-50 translate-x-full bg-background data-open:translate-x-0",
            // Wide screens: beside it, growing from nothing as the chat narrows.
            // Its width animates, not its flex: browsers snap a flex-grow
            // that starts or ends at 0. The chat takes what is left, 400px
            // once open.
            "xl:static xl:z-auto xl:w-0 xl:flex-none xl:translate-x-0 xl:overflow-hidden xl:rounded-lg xl:border xl:border-transparent xl:opacity-0",
            "xl:data-open:mx-2 xl:data-open:w-[calc(100%-400px-1rem)] xl:data-open:border-border xl:data-open:opacity-100",
            WORKSPACE_MOTION
          )}
        >
          {/* Laid out at its open width, so it slides in rather than reflowing. */}
          <div className="h-full xl:min-w-[48rem]">
            {shownPresetId ? (
              <CustomPresetPanel id={shownPresetId} onClose={workspace.close} />
            ) : null}
          </div>
        </section>
      </SidebarProvider>
    </AssistantChatProvider>
  )
}

/**
 * Stand-in turns for a chat that is still loading. Sized like the real thing —
 * a short prompt, a reply, then preset cards — so the conversation does not
 * jump when it lands.
 */
function AssistantChatSkeleton() {
  return (
    <div
      className="mx-auto flex w-full max-w-4xl flex-col gap-8 p-4"
      role="status"
      aria-label="Loading chat"
    >
      <Skeleton className="h-9 w-2/3 self-end rounded-lg sm:w-1/3" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-36 rounded-lg" />
        <Skeleton className="h-36 rounded-lg" />
      </div>
    </div>
  )
}

/**
 * The chats, the chat and the panel move as one: the same length and easing,
 * none for a panel that was open on arrival or for reduced motion.
 */
const WORKSPACE_MOTION =
  "transition-[width,margin,opacity,translate,border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] data-instant:transition-none motion-reduce:transition-none"
