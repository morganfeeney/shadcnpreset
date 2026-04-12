"use client"

import Link from "next/link"
import * as React from "react"
import { Loader2Icon, MessageCircleIcon } from "lucide-react"

import { PresetIframeCard } from "@/components/preset-iframe-card"
import { Button, buttonVariants } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { AssistantTurn } from "@/lib/search/assistant/schema"
import { cn } from "@/lib/utils"

type ChatMessage = { role: "user" | "assistant"; content: string }

export function AssistantChat() {
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Describe the preset you want—product, mood, dark vs light UI, industry (e.g. fintech dashboard). I may ask a short follow-up; when we’re aligned, you’ll get up to four preset previews here (live theme cards).",
    },
  ])
  const [input, setInput] = React.useState("")
  const [pending, setPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [lastTurn, setLastTurn] = React.useState<AssistantTurn | null>(null)
  const bottomRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, lastTurn, pending])

  async function sendContent(text: string) {
    const trimmed = text.trim()
    if (!trimmed || pending) return

    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: trimmed },
    ]
    setMessages(nextMessages)
    setInput("")
    setError(null)
    setPending(true)
    setLastTurn(null)

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      })
      const data = (await res.json()) as AssistantTurn & { error?: string }

      if (!res.ok) {
        setError(
          typeof data.error === "string"
            ? data.error
            : `Request failed (${res.status}) — try again.`
        )
        return
      }

      if ("error" in data && typeof data.error === "string") {
        setError(data.error)
        return
      }

      if (!("phase" in data)) {
        setError("Unexpected response — try again.")
        return
      }

      if (data.phase === "ready") {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.assistantMessage },
        ])
        setLastTurn(data)
        return
      }

      setLastTurn(data)
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.assistantMessage },
      ])
    } catch {
      setError("Network error — try again.")
    } finally {
      setPending(false)
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    void sendContent(input)
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 pb-16">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          AI preset finder
        </h1>
        <p className="text-sm text-muted-foreground">
          Describe what you want in chat; when ready, you’ll see up to four
          encoded presets as live previews below.
        </p>
      </div>

      <div
        className="flex min-h-[min(50vh,420px)] flex-col gap-3 rounded-xl border border-border bg-card/40 p-4"
        role="log"
        aria-live="polite"
      >
        <ul className="flex flex-col gap-3">
          {messages.map((m, i) => (
            <li
              key={`${i}-${m.role}`}
              className={cn(
                "max-w-[92%] rounded-lg px-3 py-2 text-sm leading-relaxed",
                m.role === "user"
                  ? "ml-auto bg-primary text-primary-foreground"
                  : "mr-auto bg-muted/80 text-foreground"
              )}
            >
              {m.content}
            </li>
          ))}
          {pending ? (
            <li className="mr-auto flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
              <Loader2Icon className="size-4 animate-spin" />
              Thinking…
            </li>
          ) : null}
        </ul>
        <div ref={bottomRef} />
      </div>

      {lastTurn?.phase === "gathering" && lastTurn.followUpQuestions.length ? (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Quick replies
          </p>
          <div className="flex flex-wrap gap-2">
            {lastTurn.followUpQuestions.map((q) => (
              <Button
                key={q}
                type="button"
                variant="outline"
                size="sm"
                className="h-auto max-w-full whitespace-normal py-2 text-left text-xs"
                onClick={() => void sendContent(q)}
                disabled={pending}
              >
                {q}
              </Button>
            ))}
          </div>
        </div>
      ) : null}

      {lastTurn?.phase === "ready" && lastTurn.presets.length ? (
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Preset previews
          </p>
          <ul className="grid gap-6 sm:grid-cols-2">
            {lastTurn.presets.map((p) => (
              <li key={p.code}>
                <PresetIframeCard
                  code={p.code}
                  title={p.code}
                  description={p.description}
                />
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <form
        onSubmit={onSubmit}
        className="sticky bottom-0 grid gap-2 border-t border-border bg-background/95 pt-4 backdrop-blur"
      >
        <label className="sr-only" htmlFor="assistant-input">
          Message
        </label>
        <Textarea
          id="assistant-input"
          rows={3}
          placeholder="Type an answer or describe what you want…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={pending}
          className="min-h-[88px] resize-y"
        />
        <div className="flex justify-end gap-2">
          <Link
            href="/"
            className={buttonVariants({ variant: "ghost", size: "default" })}
          >
            <MessageCircleIcon className="mr-1.5 size-4 opacity-70" />
            Home
          </Link>
          <Button type="submit" disabled={pending || !input.trim()}>
            Send
          </Button>
        </div>
      </form>
    </div>
  )
}
