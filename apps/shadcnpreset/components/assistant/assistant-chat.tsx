"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { SquarePen } from "lucide-react"
import { toast } from "sonner"

import { AssistantChatProvider } from "@/components/assistant/assistant-chat-context"
import { AssistantConversation } from "@/components/assistant/assistant-conversation"
import { AssistantPreviewCard } from "@/components/assistant/assistant-preview-card"
import { AssistantPromptComposer } from "@/components/assistant/assistant-prompt-composer"
import { PresetStyleOverviewCard } from "@/components/preset-style-overview-card"
import { RecentChatsList } from "@/components/assistant/recent-chats-list"
import { Button } from "@/components/ui/button"
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
import { assistantChatPath } from "@/lib/assistant-chat-path"
import { presetBrowsePath } from "@/lib/preset-preview"
import { cn } from "@/lib/utils"

export function AssistantChat({
  /** The chat the URL names, or null on `/assistant`. */
  routeChatId,
}: {
  routeChatId: string | null
}) {
  const router = useRouter()
  const chat = useAssistantChat({ initialChatId: routeChatId })
  const {
    activeChatId,
    chatLoadError,
    composerResetKey,
    error,
    hasInteracted,
    lastTurn,
    messages,
    onPromptSubmit,
    pending,
    requiresAuth,
    openChatFromRoute,
    sendContent,
  } = chat

  React.useEffect(() => {
    trackEvent("ai_assistant_open", { page_path: "/assistant" })
  }, [])

  // The route decides which chat is open, and a link, a sidebar click and the
  // browser's back button all arrive the same way: as a new `routeChatId`. The
  // page stays mounted across those, so the chat has to follow the prop.
  // https://react.dev/learn/you-might-not-need-an-effect
  const [syncedChatId, setSyncedChatId] = React.useState(routeChatId)
  if (routeChatId !== syncedChatId) {
    setSyncedChatId(routeChatId)
    openChatFromRoute(routeChatId)
  }

  // The other direction, for a chat id that appears without anyone navigating:
  // the first send naming a new chat, or deleting the chat being read. It only
  // corrects the URL, so it replaces rather than pushes. Skipped while signed
  // out — sign-in returns to window.location.href, and the hook parks the chat
  // id until the session resolves.
  React.useEffect(() => {
    if (requiresAuth || activeChatId === routeChatId) return
    router.replace(assistantChatPath(activeChatId), { scroll: false })
  }, [activeChatId, requiresAuth, routeChatId, router])

  // A URL that names no chat: say why in a toast and hand back the new-chat
  // page, which drops the dead id from the address bar through the effect
  // above rather than leaving it there to be reloaded.
  React.useEffect(() => {
    if (!chatLoadError) return
    toast.error(chatLoadError, { id: "assistant-chat-load" })
    openChatFromRoute(null)
  }, [chatLoadError, openChatFromRoute])

  // Opening a chat is somewhere the user can come back to, so it pushes.
  function openChat(chatId: string) {
    if (pending || chatId === routeChatId) return
    router.push(assistantChatPath(chatId), { scroll: false })
  }

  function openNewChat() {
    if (pending || !routeChatId) return
    router.push(assistantChatPath(null), { scroll: false })
  }

  return (
    <AssistantChatProvider
      value={{ ...chat, setActiveChatId: openChat }}
    >
      <SidebarProvider className="min-h-0 flex-1">
        <Sidebar
          collapsible="none"
          className="hidden border-r border-border/70 md:sticky md:top-0 md:flex md:h-[calc(100svh-64px)]"
        >
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={!routeChatId}
                      onClick={openNewChat}
                      disabled={pending}
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

        <div className="flex-1 md:pr-2">
          <div
            className={cn(
              "mx-auto grid h-full w-full content-center rounded-lg border",
              hasInteracted ? "content-between pt-10" : "content-center"
            )}
          >
            <div>
              <div
                className={cn("text-center", hasInteracted ? "hidden" : "pt-0")}
              >
                <h1 className="text-[32px] font-semibold tracking-tight text-balance">
                  Describe your ideal shadcn preset
                </h1>
              </div>

              {hasInteracted ? (
                <div className="mx-auto grid w-full max-w-4xl transition-all duration-300">
                  <AssistantConversation
                    messages={messages}
                    pending={pending}
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
              hasInteracted={hasInteracted}
              pending={pending}
              resetKey={composerResetKey}
              onPromptSubmit={onPromptSubmit}
            />
          </div>
        </div>
      </SidebarProvider>
    </AssistantChatProvider>
  )
}
