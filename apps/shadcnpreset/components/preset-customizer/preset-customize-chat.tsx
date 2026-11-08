"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"

import { AssistantConversation } from "@/components/assistant/assistant-conversation"
import { AssistantPromptComposer } from "@/components/assistant/assistant-prompt-composer"
import { ProWall } from "@/components/assistant/pro-wall"
import {
  useAssistantChat,
  type CustomizedPreset,
} from "@/components/assistant/use-assistant-chat"
import { usePresetCustomize } from "@/components/preset-customizer/preset-customize"

type Usage = { used: number; limit: number | null }

/** Things a preset can become, to start from: each sends as it reads. */
const STARTERS = [
  "Use my brand blue #1D4ED8",
  "Warm and earthy, for a coffee roaster",
  "Cool blues and soft greys, for a health app",
  "Sharp corners and a monospace font",
]

/** Free generations had, against the limit; re-read after each answer. */
function useAssistantUsage(signedIn: boolean, answers: number) {
  return useQuery<Usage>({
    queryKey: ["assistantUsage", signedIn, answers],
    queryFn: async () => {
      const response = await fetch("/api/assistant/usage")
      if (!response.ok) throw new Error("usage")
      return (await response.json()) as Usage
    },
    placeholderData: (previous) => previous,
  })
}

/**
 * Ask AI, about the preset being customized: Ask AI's own conversation and
 * composer, with each answer changing the preset on show, as Controls would.
 * Sending signed out asks to sign in; past the free generations, Pro.
 */
export function PresetCustomizeChat() {
  const { value, setValue, chat: chatId, setChat } = usePresetCustomize()
  const customPreset = React.useMemo<CustomizedPreset>(
    () => ({ presetCode: value.code, colours: value.colours }),
    [value]
  )
  // The conversation is in the address with the preset, so a reload or a
  // link opens it again; each answer writes both at once.
  const chat = useAssistantChat({
    initialChatId: chatId,
    customPreset,
    onCustomPresetEdited: (preset, editedIn) =>
      setValue(
        { code: preset.presetCode, colours: preset.colours },
        true,
        editedIn
      ),
  })
  const { startNewChat, chatLoadError } = chat
  const newChat = React.useCallback(() => {
    startNewChat()
    setChat(null)
  }, [setChat, startNewChat])

  // One that won't open (someone else's, from a shared link, or deleted) is
  // let go of, for a new one.
  React.useEffect(() => {
    if (chatLoadError) newChat()
  }, [chatLoadError, newChat])

  const answers = chat.messages.filter((m) => m.role === "assistant").length
  const usage = useAssistantUsage(!chat.requiresAuth, answers).data
  const limit = usage?.limit ?? null
  const left = usage && limit !== null ? Math.max(0, limit - usage.used) : null
  const walled = chat.proRequired || left === 0

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {chat.isChatHydrating ? (
        <div className="flex-1" />
      ) : chat.hasInteracted ? (
        <AssistantConversation
          messages={chat.messages}
          pending={chat.pending}
          renderPresets={() => null}
          pendingKind={chat.pendingKind}
          pendingVariant="compact"
          className="min-h-0 flex-1"
          conversationContentClassName="px-4"
        />
      ) : (
        <div className="flex flex-1 flex-col justify-center gap-3 px-4">
          <h2 className="text-lg font-semibold tracking-tight">
            Make this preset yours
          </h2>
          <ul className="flex flex-col divide-y">
            {STARTERS.map((starter) => (
              <li key={starter}>
                <button
                  type="button"
                  disabled={chat.pending || chat.isChatHydrating}
                  onClick={() => void chat.onPromptSubmit(starter)}
                  className="w-full py-2.5 text-left text-sm text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none"
                >
                  {starter}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {chat.error ? (
        <p role="alert" className="px-4 pt-2 text-xs text-destructive">
          {chat.error}
        </p>
      ) : null}
      {walled ? (
        <ProWall className="p-3" />
      ) : (
        <>
          {left !== null && chat.hasInteracted ? (
            <p className="px-4 pt-2 text-xs text-muted-foreground">
              {left} of {limit} free left
            </p>
          ) : null}
          <AssistantPromptComposer
            hasInteracted={chat.hasInteracted}
            pending={chat.pending}
            disabled={chat.isChatHydrating}
            resetKey={chat.composerResetKey}
            onPromptSubmit={chat.onPromptSubmit}
            onNewChat={chat.hasInteracted ? newChat : undefined}
            variant="compact"
            placeholder="Ask for changes…"
          />
        </>
      )}
    </div>
  )
}
