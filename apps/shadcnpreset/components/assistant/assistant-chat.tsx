"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { SquarePen } from "lucide-react"
import { toast } from "sonner"

import { AssistantChatProvider } from "@/components/assistant/assistant-chat-context"
import { AssistantConversation } from "@/components/assistant/assistant-conversation"
import { AssistantPreviewCard } from "@/components/assistant/assistant-preview-card"
import { AssistantPromptComposer } from "@/components/assistant/assistant-prompt-composer"
import { PresetStyleOverviewCard } from "@/components/preset-style-overview-card"
import { RecentChatsList } from "@/components/assistant/recent-chats-list"
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
import { useAssistantChat } from "@/components/assistant/use-assistant-chat"
import { trackEvent } from "@/lib/analytics-events"
import {
  assistantChatIdFromPath,
  assistantChatPath,
} from "@/lib/assistant-chat-path"
import { presetBrowsePath } from "@/lib/preset-preview"
import { cn } from "@/lib/utils"

export function AssistantChat({
  /** The chat the URL names, or null on `/assistant`. */
  routeChatId,
}: {
  routeChatId: string | null
}) {
  const router = useRouter()
  const chat = useAssistantChat({
    initialChatId: routeChatId,
    // A send names its own chat, so the URL moves with the click.
    onChatCreated: (chatId) =>
      router.push(assistantChatPath(chatId), { scroll: false }),
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
    openChatFromRoute,
    sendContent,
  } = chat

  // A chat named in the URL arrives empty for a beat. Give it the conversation
  // layout straight away, so someone who followed a link to an existing chat
  // sees it loading rather than the new-chat hero flashing up first.
  const showsConversation = hasInteracted || isChatHydrating

  React.useEffect(() => {
    trackEvent("ai_assistant_open", { page_path: "/assistant" })
  }, [])

  /**
   * Which chat the URL names. Read from the address bar, not from this page's
   * params: a client-side navigation back to the chat you just left moves the
   * URL but re-renders this page with the params it already had. `routeChatId`
   * is reliable on the first render only, which is what it seeds the hook for.
   */
  const urlChatId = assistantChatIdFromPath(usePathname())

  // A link, a sidebar click and the browser's back button all arrive the same
  // way: as a new URL. The page stays mounted across those, so the chat has
  // to follow it. https://react.dev/learn/you-might-not-need-an-effect
  const [syncedChatId, setSyncedChatId] = React.useState(urlChatId)
  if (urlChatId !== syncedChatId) {
    setSyncedChatId(urlChatId)
    openChatFromRoute(urlChatId)
  }

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

        <div className="flex min-w-0 flex-1 flex-col md:pr-2">
          <div
            className={cn(
              "mx-auto flex h-full w-full min-h-0 flex-col rounded-lg border",
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
                <div className="mx-auto w-full max-w-4xl flex flex-col gap-2 p-4">
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

              {error ? (
                <p
                  className="mx-auto w-full max-w-4xl text-sm text-destructive"
                  role="alert"
                >
                  {error}
                </p>
              ) : null}
            </div>

            <AssistantPromptComposer
              hasInteracted={showsConversation}
              pending={pending}
              disabled={isChatHydrating}
              resetKey={composerResetKey}
              onPromptSubmit={onPromptSubmit}
            />
          </div>
        </div>
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
