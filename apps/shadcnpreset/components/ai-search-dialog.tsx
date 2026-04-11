"use client"

import { useRouter } from "next/navigation"
import * as React from "react"
import { Loader2Icon } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { trackAiSearchAssistant, trackSearchSubmit } from "@/lib/analytics-events"
import { persistAiSearchContext } from "@/lib/ai-search-session"
import { buildSearchHref } from "@/lib/search-route"
import { cn } from "@/lib/utils"

type ChatTurn = { role: "user" | "assistant"; content: string }

type AiSearchDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  pagePath: string
}

export function AiSearchDialog({
  open,
  onOpenChange,
  pagePath,
}: AiSearchDialogProps) {
  const router = useRouter()
  const [input, setInput] = React.useState("")
  const [turns, setTurns] = React.useState<ChatTurn[]>([])
  const [error, setError] = React.useState<string | null>(null)
  const [pending, setPending] = React.useState(false)

  React.useEffect(() => {
    if (!open) return
    setError(null)
  }, [open])

  function reset() {
    setInput("")
    setTurns([])
    setError(null)
    setPending(false)
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset()
    onOpenChange(next)
  }

  async function submit() {
    const text = input.trim()
    if (!text || pending) return

    setError(null)
    setPending(true)

    const nextTurns: ChatTurn[] = [...turns, { role: "user", content: text }]
    setTurns(nextTurns)
    setInput("")

    try {
      const response = await fetch("/api/search/ai/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextTurns.map((t) => ({
            role: t.role,
            content: t.content,
          })),
        }),
      })

      const data = (await response.json()) as {
        error?: string
        optimizedSearchQuery?: string
      }

      if (!response.ok) {
        setError(data.error ?? "Request failed")
        setPending(false)
        return
      }

      const q = data.optimizedSearchQuery?.trim()
      if (!q) {
        setError("No search phrase returned")
        setPending(false)
        return
      }

      trackAiSearchAssistant({ pagePath })
      trackSearchSubmit({
        pagePath,
        mode: "smart",
        searchTerm: q,
        source: "ai_assistant",
      })

      const userOnly = nextTurns
        .filter((t): t is ChatTurn & { role: "user" } => t.role === "user")
        .map((t) => t.content)
      persistAiSearchContext({
        optimizedQuery: q,
        userMessages: userOnly,
      })

      handleOpenChange(false)
      router.push(buildSearchHref("smart", q))
    } catch {
      setError("Network error — try again.")
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          "flex max-h-[min(90vh,640px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg"
        )}
        showCloseButton={!pending}
      >
        <div className="shrink-0 space-y-1 border-b border-border px-4 pt-4 pb-3">
          <DialogHeader className="gap-2 text-left">
            <DialogTitle>AI search assistant</DialogTitle>
            <DialogDescription>
              Describe the product, audience, or vibe. We&apos;ll turn it into a
              smart search you can refine in follow-up messages.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3">
          {turns.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Example: &quot;Dark fintech dashboard, lots of charts, not too
              playful&quot;
            </p>
          ) : (
            <ul className="space-y-2 text-sm">
              {turns.map((t, i) => (
                <li
                  key={`${i}-${t.role}`}
                  className={cn(
                    "rounded-lg px-3 py-2",
                    t.role === "user"
                      ? "ml-4 bg-muted/80 text-foreground"
                      : "mr-4 bg-muted/40 text-muted-foreground"
                  )}
                >
                  {t.content}
                </li>
              ))}
            </ul>
          )}
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <div className="shrink-0 space-y-2 border-t border-border px-4 py-3">
          <Textarea
            aria-label="Describe what you are looking for"
            className={cn(
              "min-h-[88px] resize-none",
              // One focus ring: avoid border + thick ring reading as a double stroke
              "border border-border bg-background focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/60 focus-visible:ring-offset-0"
            )}
            placeholder="Type your message…"
            value={input}
            disabled={pending}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                void submit()
              }
            }}
          />
        </div>

        <div
          className={cn(
            "flex shrink-0 flex-col-reverse gap-2 border-t border-border bg-muted/40 px-4 py-3 sm:flex-row sm:justify-end"
          )}
        >
          <Button
            type="button"
            variant="secondary"
            disabled={pending}
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={pending || !input.trim()}
            onClick={() => void submit()}
          >
            {pending ? (
              <>
                <Loader2Icon className="animate-spin" />
                Working…
              </>
            ) : (
              "Search presets"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
