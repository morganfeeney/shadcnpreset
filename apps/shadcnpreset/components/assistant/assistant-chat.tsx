"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { SquarePen } from "lucide-react"
import { toast } from "sonner"

import { AssistantChatProvider } from "@/components/assistant/assistant-chat-context"
import { AssistantConversation } from "@/components/assistant/assistant-conversation"
import { AssistantPreviewCard } from "@/components/assistant/assistant-preview-card"
import { AssistantPromptComposer } from "@/components/assistant/assistant-prompt-composer"
import { AssistantPresetPanel } from "@/components/assistant/assistant-preset-panel"
import { ProWall } from "@/components/assistant/pro-wall"
import { PresetCardCustomizeProvider } from "@/components/preset-card-customize"
import { useSavedCustomPreset } from "@/components/preset-customizer/preset-customize"
import { useSettledAfterMotion } from "@/components/assistant/use-settled-after-motion"
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
  type CustomizedPreset,
} from "@/components/assistant/use-assistant-chat"
import { useUrlChatId } from "@/components/assistant/use-url-chat-id"
import { trackEvent } from "@/lib/analytics-events"
import { assistantChatPath } from "@/lib/assistant-chat-path"
import { readBrandColours } from "@/lib/brand-theme"
import { customColoursFrom, NO_CUSTOM_COLOURS } from "@/lib/custom-colours"
import { customizeRequestText } from "@/lib/customize-preset"
import {
  hasColours,
  readPresetQuery,
  sameColours,
  withColours,
} from "@/lib/preset-draft"
import { presetBrowsePath } from "@/lib/preset-preview"
import { cn } from "@/lib/utils"

export function AssistantChat({
  /** The chat the URL names, or null on `/assistant`. */
  routeChatId,
}: {
  routeChatId: string | null
}) {
  const router = useRouter()
  // A preset opens beside the conversation to customize: on a wide screen the
  // chats fold away and the chat narrows to a column; narrower, it slides
  // over. While it is open, every message is a change to it.
  const workspace = useWorkspacePreset()
  const panelOpen = Boolean(workspace.code)
  // The preset as the panel shows it, for a message to change: its code,
  // and its colours (unsaved, or as saved).
  const customizing = readPresetQuery(workspace.query)
  const saved = useSavedCustomPreset(workspace.code ? customizing.custom : null)
  const keptColours =
    (customizing.custom && saved.data?.colours) || NO_CUSTOM_COLOURS
  const customPreset: CustomizedPreset | null = workspace.code
    ? {
        presetCode: workspace.code,
        colours: customizing.colours ?? keptColours,
      }
    : null
  // When the composer grows (a note above it, a longer message) or the window
  // changes, the conversation's box shrinks under content that does not move,
  // hiding its end. Someone reading the end keeps it in view; someone who
  // has scrolled back stays where they are.
  const conversationScroller = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    const scroller = conversationScroller.current
    if (!scroller || typeof ResizeObserver === "undefined") return
    let atEnd = true
    const onScroll = () => {
      atEnd =
        scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight < 8
    }
    const keepEnd = new ResizeObserver(() => {
      if (atEnd) scroller.scrollTop = scroller.scrollHeight
    })
    scroller.addEventListener("scroll", onScroll, { passive: true })
    keepEnd.observe(scroller)
    return () => {
      keepEnd.disconnect()
      scroller.removeEventListener("scroll", onScroll)
    }
  }, [])
  const chat = useAssistantChat({
    initialChatId: routeChatId,
    customPreset,
    // The panel shows the edit as it would any change made there: another
    // preset, and colours unsaved until saved.
    onCustomPresetEdited: (preset) =>
      workspace.goTo(
        preset.presetCode,
        withColours(
          new URLSearchParams(window.location.search),
          sameColours(preset.colours, keptColours) ? null : preset.colours
        )
      ),
    // The answer has made this page a conversation worth returning to, so it
    // gains an address. Replace, not push: nobody navigated here, the page
    // they were already on became the chat. A custom preset the answer opened
    // stays open.
    onChatCreated: (chatId) =>
      router.replace(`${assistantChatPath(chatId)}${window.location.search}`, {
        scroll: false,
      }),
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

  // Any preset in the chat can be customized, from its card: shown beside
  // the chat in any exact colours the chat asked for, as unsaved changes.
  // One function for the life of the chat, so the cards stay memoised; it
  // reads the latest messages when called.
  const latestMessages = React.useRef(messages)
  React.useEffect(() => {
    latestMessages.current = messages
  })
  const { show } = workspace
  const customize = React.useCallback(
    (code: string) => {
      trackEvent("custom_preset_customize_click", { preset_code: code })
      const colours = customColoursFrom(
        readBrandColours(customizeRequestText(latestMessages.current))
      )
      if (show(code, hasColours(colours) ? colours : null)) {
        trackEvent("custom_preset_panel_open", {})
      }
    },
    [show]
  )

  React.useEffect(() => {
    trackEvent("ai_assistant_open", { page_path: "/assistant" })
  }, [])

  const urlChatId = useUrlChatId()

  // Kept through the close, so the panel does not empty as it slides away.
  const [shown, setShown] = React.useState(
    workspace.code ? { code: workspace.code, query: workspace.query } : null
  )
  if (
    workspace.code &&
    (shown?.code !== workspace.code || shown.query !== workspace.query)
  ) {
    setShown({ code: workspace.code, query: workspace.query })
  }

  // The preview waits out the panel's slide in: loading it while the panel
  // grows makes it judder.
  const panelRef = React.useRef<HTMLElement>(null)
  const settledOpen = useSettledAfterMotion(panelOpen, panelRef)

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
      <SidebarProvider className="@container/workspace h-full min-h-0 overflow-hidden">
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
              ref={conversationScroller}
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
                <PresetCardCustomizeProvider
                  customize={customize}
                  customizeOnClick={panelOpen}
                >
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
                              "generated"
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
                </PresetCardCustomizeProvider>
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

              {showsAd && !panelOpen ? (
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
          ref={panelRef}
          aria-label="Custom preset"
          inert={!panelOpen}
          data-open={panelOpen || undefined}
          data-instant={workspace.instant || undefined}
          className={cn(
            // Narrower screens: over the chat, in from the right.
            "fixed inset-0 z-50 translate-x-full bg-background data-open:translate-x-0",
            // Wide screens: beside it, growing from nothing as the chat narrows.
            // Its width animates, not its flex: browsers snap a flex-grow
            // that starts or ends at 0. The chat takes what is left, 300px
            // once open.
            "xl:static xl:z-auto xl:w-0 xl:flex-none xl:translate-x-0 xl:overflow-hidden xl:rounded-lg xl:border xl:border-transparent xl:opacity-0",
            "xl:data-open:mx-2 xl:data-open:w-[calc(100%-300px-1rem)] xl:data-open:border-border xl:data-open:opacity-100",
            WORKSPACE_MOTION
          )}
        >
          {/* At its open width (less its border) throughout, so the preview,
            a whole page, slides in rather than reflowing every frame. */}
          <div className="h-full xl:w-[calc(100cqw-300px-1rem-2px)]">
            {shown ? (
              <AssistantPresetPanel
                code={shown.code}
                query={shown.query}
                goTo={workspace.goTo}
                waiting={panelOpen && !settledOpen}
                onClose={workspace.close}
              />
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
