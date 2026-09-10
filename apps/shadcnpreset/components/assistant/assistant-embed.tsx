"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { SparklesIcon } from "lucide-react"

import {
  AssistantConversation,
  AssistantPendingCompact,
} from "@/components/assistant/assistant-conversation"
import { AssistantPromptComposer } from "@/components/assistant/assistant-prompt-composer"
import { useAssistantChat } from "@/components/assistant/use-assistant-chat"
import { usePresetPageLiveOptional } from "@/components/preset-page-live-context"
import { PresetRelatedList } from "@/components/preset-related-list"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { looksLikePreviewRequest } from "@/lib/generated-preview/intent"
import { PRESET_CHAT_PARAM } from "@/lib/preset-preview"
import { trackEvent } from "@/lib/analytics-events"
import type { ResolvedPreset } from "@/lib/preset"
import { useAuthStore } from "@/stores/auth-store"

const REFINE_CHIPS = ["Warmer palette", "Serif headings", "Higher contrast"]

type AssistantEmbedProps = {
  resolved: ResolvedPreset
  onApply?: () => void
}

export function AssistantEmbed({
  resolved,
  onApply,
}: AssistantEmbedProps) {
  const live = usePresetPageLiveOptional()
  const liveCode = live?.livePresetCode ?? resolved.code
  const searchParams = useSearchParams()
  // Set once, on mount: /assistant links here with the chat to carry over.
  const [initialChatId] = React.useState(() =>
    searchParams.get(PRESET_CHAT_PARAM)
  )
  const ensureAuthenticated = useAuthStore((state) => state.ensureAuthenticated)
  const authStatus = useAuthStore((state) => state.status)

  const chat = useAssistantChat({
    seedPresetCodes: [liveCode],
    livePresetCode: liveCode,
    initialChatId,
    // Previews go to the main preview pane only — the sidebar is too narrow to
    // render one usefully, and the pane is already right there.
    onPreview: live?.showGeneratedPreview,
  })
  const {
    activeChatQuery,
    composerResetKey,
    error,
    hasInteracted,
    lastTurn,
    messages,
    onPromptSubmit,
    pending,
    sendContent,
  } = chat
  const lastUserText = React.useMemo(
    () =>
      [...messages].reverse().find((message) => message.role === "user")?.content,
    [messages]
  )
  const pendingPreview =
    pending && Boolean(lastUserText && looksLikePreviewRequest(lastUserText))
  const openedPathRef = React.useRef(`/preset/${liveCode}`)

  React.useEffect(() => {
    trackEvent("ai_assistant_open", { page_path: openedPathRef.current })
  }, [])

  function applyPreset(code: string) {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }
    live?.selectLivePreset(code)
    onApply?.()
  }

  // A linked-to chat arrives empty for a beat; show it loading rather than
  // flashing the "describe your ideal preset" empty state first.
  const loadingLinkedChat =
    Boolean(initialChatId) && !hasInteracted && activeChatQuery.isLoading

  return (
    <div className="flex h-full min-h-0 flex-col">
      {loadingLinkedChat ? (
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-3">
          <Skeleton className="h-4 w-2/3 self-end" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="aspect-[2/1] w-full" />
        </div>
      ) : hasInteracted ? (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <AssistantConversation
            className="h-full min-h-0 overscroll-contain"
            messages={messages}
            pending={pending}
            conversationContentClassName="gap-4 p-3"
            pendingContent={
              <AssistantPendingCompact
                label={
                  pendingPreview ? "Generating preview..." : "Generating presets..."
                }
              />
            }
            renderPresets={(message) => (
              <PresetRelatedList
                items={message.presets.map((preset) => ({
                  code: preset.code,
                  title: preset.code,
                  description: preset.description,
                }))}
                currentCode={liveCode}
                onSelectPreset={applyPreset}
                className="mt-3 p-0"
              />
            )}
          />

          {lastTurn?.phase === "gathering" && lastTurn.followUpQuestions.length ? (
            <div className="flex shrink-0 flex-col gap-2 border-t p-3">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Quick replies
              </p>
              <div className="flex flex-wrap gap-2">
                {lastTurn.followUpQuestions.map((question) => (
                  <Button
                    key={question}
                    type="button"
                    variant="outline"
                    size="xs"
                    className="h-auto max-w-full py-1.5 text-left text-xs whitespace-normal"
                    onClick={() => void sendContent(question)}
                    disabled={pending}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          ) : null}

          {error ? (
            <p className="shrink-0 px-3 pb-2 text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col justify-end overflow-y-auto p-3">
          <Empty className="border-0 p-3">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <SparklesIcon />
              </EmptyMedia>
              <EmptyTitle>Describe your ideal shadcn preset</EmptyTitle>
              <EmptyDescription>
                Describe the direction you want. Results apply into the live
                preview.
              </EmptyDescription>
            </EmptyHeader>
            {authStatus === "anonymous" ? (
              <EmptyContent>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => void ensureAuthenticated()}
                >
                  Sign in
                </Button>
              </EmptyContent>
            ) : null}
          </Empty>
          <div className="flex flex-wrap gap-2">
            {REFINE_CHIPS.map((chip) => (
              <Button
                key={chip}
                type="button"
                variant="outline"
                size="xs"
                onClick={() => void onPromptSubmit(chip)}
                disabled={pending}
              >
                {chip}
              </Button>
            ))}
          </div>
          {error ? (
            <p className="pt-2 text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      )}

      <div className="shrink-0 border-t">
        <AssistantPromptComposer
          variant="compact"
          hasInteracted={hasInteracted}
          pending={pending}
          resetKey={composerResetKey}
          onPromptSubmit={onPromptSubmit}
          placeholder={
            hasInteracted ? "Reply to refine..." : "Refine this preset..."
          }
        />
      </div>
    </div>
  )
}
