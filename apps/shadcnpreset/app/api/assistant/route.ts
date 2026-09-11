import { openai } from "@ai-sdk/openai"
import { generateText, Output } from "ai"
import {
  DEFAULT_PRESET_CONFIG,
  encodePreset,
  type PresetConfig,
} from "shadcn/preset"
import { NextResponse } from "next/server"
import { z } from "zod"

import {
  getAssistantChatForUser,
  saveAssistantChatForUser,
} from "@/lib/assistant-chat-store"
import { GENERATED_PREVIEW_COMPONENT_NAMES } from "@/lib/generated-preview/catalog"
import {
  describeGeneratedPreviewIssue,
  validateGeneratedPreviewSource,
} from "@/lib/generated-preview/validate"
import { getSessionUser } from "@/lib/auth"
import { clampPresetConfigForV4Preview } from "@/lib/preset-catalog"
import { resolvePresetFromCode } from "@/lib/preset"
import {
  applyExplicitFacetConstraints,
  applyPaletteConstraints,
  applyTypographyConstraints,
  buildPresetCardDescription,
  extractExplicitFacetConstraints,
  extractPaletteConstraints,
  extractTypographyConstraints,
} from "@/lib/search/assistant/constraint-engine"
import { extractNamedPresetCode } from "@/lib/search/assistant/named-preset"
import { toPersistedAssistantMessage } from "@/lib/search/assistant/message-persistence"
import { normalizeQuickReplies } from "@/lib/search/assistant/quick-replies"
import { buildAssistantSystemPrompt } from "@/lib/search/assistant/system-prompt"
import {
  assistantTurnOutputSchema,
  normalizeAssistantTurn,
  type AssistantPreview,
  type AssistantPresetVariantPayload,
  type AssistantReady,
} from "@/lib/search/assistant/schema"

export const maxDuration = 60

/**
 * Messages a single chat may hold.
 *
 * The client posts the whole conversation back on every send, so this bounds
 * the request, the prompt and the row count together. Reaching it ends the
 * chat rather than silently dropping the oldest turns — a conversation that
 * quietly forgets its own beginning is worse than one that says it is full.
 */
const MAX_CHAT_MESSAGES = 32

const bodySchema = z.object({
  chatId: z.string().uuid().optional(),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(12000),
        kind: z.enum(["text", "presets", "preview"]).optional(),
        presets: z
          .array(
            z.object({
              code: z.string().min(2).max(64),
              caption: z.string().min(1).max(160),
              description: z.string().min(1).max(400),
            })
          )
          .max(4)
          .optional(),
        preview: z
          .object({
            title: z.string().min(1).max(60),
            code: z.string().min(1).max(24000),
            presetCode: z.string().min(2).max(32).optional(),
          })
          .optional(),
        followUpQuestions: z.array(z.string().min(1).max(160)).max(4).optional(),
      })
    )
    .min(1)
    // The new turn only. History for an existing chat is read from the
    // database, so the request carries a message rather than a transcript.
    .max(4),
  previousPresetCodes: z.array(z.string().min(2).max(32)).max(4).optional(),
  livePresetCode: z.string().min(2).max(32).optional(),
})

function buildLivePresetContext(
  livePresetCode: string | null,
  namedPresetCode: string | null,
  previewPresetCode: string
): string {
  const lines: string[] = []
  if (livePresetCode) {
    lines.push(
      `The user is currently viewing preset ${livePresetCode} in the main preview.`
    )
  }
  if (namedPresetCode) {
    lines.push(
      `They named preset ${namedPresetCode} in their message, and the preview will use it.`
    )
  }
  if (!livePresetCode && !namedPresetCode) {
    lines.push(
      `No preset is on screen. A preview will render on the default preset, ${previewPresetCode}.`,
      "Say which preset it is using, and mention they can name another (e.g. \"with preset b0\") or open a preset page to change it."
    )
  }
  lines.push(
    "A preset is always available, so never ask which one to use, and never ask about style before showing a component."
  )
  return [
    ...lines,
    'If they ask to show, display, or render a component/block/layout with this preset, use phase "preview".',
    "Do not invent a new preset for show/display requests; apply generated UI onto the current live preset.",
  ].join("\n")
}

function variantToConfig(v: AssistantPresetVariantPayload): PresetConfig {
  const { caption, ...rest } = v
  void caption
  return clampPresetConfigForV4Preview(rest as PresetConfig)
}

function buildPreviousPresetContext(previousPresets: PresetConfig[]): string {
  if (!previousPresets.length) return ""
  const lines = previousPresets.map((p, i) => {
    const code = encodePreset(p)
    return `Variant ${i + 1} (${code}): style=${p.style}, baseColor=${p.baseColor}, theme=${p.theme}, chartColor=${p.chartColor ?? p.theme}, fontHeading=${p.fontHeading}, font=${p.font}, iconLibrary=${p.iconLibrary}, radius=${p.radius}, menuColor=${p.menuColor}, menuAccent=${p.menuAccent}`
  })
  return [
    "Current preset set (latest stage):",
    ...lines,
    "When the user asks for edits, treat this as the baseline set.",
    "Semantics: \"one of them\" => exactly one variant should satisfy the new facet; \"at least one\" => one or more; \"all/each/every\" => all variants.",
    "Preserve unchanged facets unless explicitly asked to modify them.",
  ].join("\n")
}

function presetToVariantPayload(
  config: PresetConfig,
  caption: string
): AssistantPresetVariantPayload {
  return {
    ...config,
    chartColor: config.chartColor ?? config.theme,
    caption,
  }
}

function mapProviderError(err: unknown): {
  status: number
  body: Record<string, unknown>
} {
  const raw = err instanceof Error ? err.message : String(err)
  const lower = raw.toLowerCase()

  if (lower.includes("unauthorized chat access")) {
    return {
      status: 403,
      body: { code: "assistant_chat_forbidden", error: "Chat access denied." },
    }
  }

  if (
    lower.includes("exceeded your current quota") ||
    lower.includes("insufficient_quota") ||
    (lower.includes("billing") && lower.includes("openai"))
  ) {
    return {
      status: 402,
      body: {
        code: "openai_quota",
        error:
          "OpenAI quota or billing issue. Check your account at platform.openai.com.",
      },
    }
  }

  if (
    lower.includes("rate limit") ||
    lower.includes("too many requests") ||
    raw.includes("429")
  ) {
    return {
      status: 429,
      body: {
        code: "openai_rate_limit",
        error: "OpenAI rate limit — try again shortly.",
      },
    }
  }

  if (
    lower.includes("invalid api key") ||
    lower.includes("incorrect api key") ||
    lower.includes("invalid_api_key")
  ) {
    return {
      status: 401,
      body: {
        code: "openai_auth",
        error: "OpenAI rejected the API key (OPENAI_API_KEY).",
      },
    }
  }

  return {
    status: 502,
    body: {
      error:
        raw.length > 500 ? `${raw.slice(0, 497)}…` : raw || "Assistant failed",
      code: "assistant_error",
    },
  }
}

/** Drops duplicate encodings — identical facet tuples → one card (see assistant prompt: vary fonts/icons/radius when colours match). */
function encodeReadyPayload(
  normalized: Extract<
    ReturnType<typeof normalizeAssistantTurn>,
    { phase: "ready" }
  >,
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  previousPresets: PresetConfig[]
): AssistantReady {
  const seen = new Set<string>()
  const presets: AssistantReady["presets"] = []
  const typographyConstraints = extractTypographyConstraints(messages)
  const paletteConstraints = extractPaletteConstraints(messages)
  const explicitConstraints = extractExplicitFacetConstraints(messages)

  const variants: AssistantPresetVariantPayload[] = [...normalized.presetVariants]
  while (variants.length < 4 && previousPresets[variants.length]) {
    variants.push(
      presetToVariantPayload(
        previousPresets[variants.length]!,
        `Variant ${variants.length + 1}`
      )
    )
  }

  for (const v of variants) {
    const config = applyExplicitFacetConstraints(
      applyPaletteConstraints(
        applyTypographyConstraints(variantToConfig(v), typographyConstraints),
        paletteConstraints
      ),
      explicitConstraints
    )
    const clamped = clampPresetConfigForV4Preview(config)
    const code = encodePreset(clamped)
    if (seen.has(code)) continue
    seen.add(code)
    presets.push({
      code,
      caption: v.caption.trim() || code,
      description: buildPresetCardDescription(clamped),
    })
    if (presets.length >= 4) break
  }

  return {
    phase: "ready",
    assistantMessage: normalized.assistantMessage,
    presets,
  }
}

type TurnMessage = { role: "user" | "assistant"; content: string }

type NormalizedPreview = Extract<
  ReturnType<typeof normalizeAssistantTurn>,
  { phase: "preview" }
>["preview"]

/**
 * Gives a preview that cannot render one chance to come back fixed.
 *
 * The renderer already caught these — an invented component, a variant that
 * does not exist, a raw `<input>` — but only once the turn was on screen, so
 * the user was the one who fed the problem back. The checks are pure string
 * work, so running them here closes that loop while the model is still in a
 * position to act on it.
 *
 * One attempt, and only for previews that fail a check. A repair that also
 * fails is returned as-is: the renderer reports it exactly as it does today,
 * so the worst case is what used to be the only case.
 */
/** How many times a preview that fails its checks is handed back to be fixed. */
const MAX_REPAIR_ATTEMPTS = 2

function logPreviewIssue(
  stage: string,
  issue: Extract<ReturnType<typeof validateGeneratedPreviewSource>, { ok: false }>
) {
  console.warn(`[api/assistant] ${stage}`, {
    error: issue.error,
    unknownComponents: issue.unknownComponents,
    invalidProps: issue.invalidProps?.map(
      ({ component, prop, value }) => `${component} ${prop}="${value}"`
    ),
    rawControls: issue.rawControls?.map(({ element }) => element),
    invalidCompositions: issue.invalidCompositions?.map(
      ({ parent, child }) => `${child} in ${parent}`
    ),
    closedOverlay: issue.closedOverlay,
    misusedAsChild: issue.misusedAsChild,
    stretchedControls: issue.stretchedControls,
    ungroupedFields: issue.ungroupedFields,
    emptyComponents: issue.emptyComponents,
    missingChildren: issue.missingChildren?.map(
      ({ parent, required }) => `${parent} without ${required}`
    ),
    missingProviders: issue.missingProviders?.map(
      ({ component, root }) => `${component} without ${root}`
    ),
  })
}

async function repairPreviewIfNeeded(
  preview: NormalizedPreview,
  assistantMessage: string,
  messages: TurnMessage[],
  askModel: (messages: TurnMessage[]) => ReturnType<typeof generateText>
): Promise<{ preview: NormalizedPreview; assistantMessage: string }> {
  let current = preview
  let issue = validateGeneratedPreviewSource(
    current.code,
    GENERATED_PREVIEW_COMPONENT_NAMES
  )
  if (issue.ok) return { preview, assistantMessage }

  // Each attempt sees its own last try and what was wrong with it. One pass
  // was not enough in practice: a preview with two invented component names
  // came back with one, which is progress the loop had no way to continue.
  const transcript: TurnMessage[] = [...messages]

  for (
    let attempt = 1;
    attempt <= MAX_REPAIR_ATTEMPTS && !issue.ok;
    attempt += 1
  ) {
    logPreviewIssue(`repairing preview (attempt ${attempt})`, issue)

    transcript.push(
      { role: "assistant", content: current.code },
      { role: "user", content: describeGeneratedPreviewIssue(issue) }
    )

    let repaired: NormalizedPreview | null = null
    try {
      const retry = await askModel(transcript)
      const normalized = retry.output ? normalizeAssistantTurn(retry.output) : null
      repaired = normalized?.phase === "preview" ? normalized.preview : null
    } catch (error) {
      console.warn("[api/assistant] preview repair errored", error)
      break
    }

    // A turn that came back as anything but a preview has lost the thread;
    // asking again from the same place will not find it.
    if (!repaired) break

    current = repaired
    issue = validateGeneratedPreviewSource(
      current.code,
      GENERATED_PREVIEW_COMPONENT_NAMES
    )
  }

  if (!issue.ok) {
    // Out of attempts. The original is what was actually asked for, and both
    // versions render the same error, so hand back the one that is not the
    // product of a failed correction.
    logPreviewIssue("preview repair gave up", issue)
    return { preview, assistantMessage }
  }

  return {
    preview: { ...current, title: preview.title },
    assistantMessage,
  }
}

export async function POST(request: Request) {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json(
      {
        error: "Sign in required to use the assistant.",
        code: "auth_required",
      },
      { status: 401 }
    )
  }

  if (!process.env.OPENAI_API_KEY?.trim()) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured." },
      { status: 503 }
    )
  }

  let json: unknown
  try {
    json = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) {
    // The rejection is almost always a message the client hydrated from a
    // stored chat, so the offending field matters more than the fact of it.
    // Without this the only record is the response body, which is gone by the
    // time anyone asks why a chat stopped accepting replies.
    console.error(
      "[api/assistant] rejected request",
      JSON.stringify(parsed.error.flatten().fieldErrors),
      parsed.error.issues.slice(0, 5).map((issue) => ({
        path: issue.path.join("."),
        code: issue.code,
        message: issue.message,
      }))
    )
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  /**
   * History comes from storage, not from the client.
   *
   * The client used to post the whole conversation back on every send and the
   * server wrote that array down as the chat — so the request grew with the
   * conversation, and a client working from a stale copy could shorten it.
   * Reading it here makes the stored chat the only version there is.
   */
  const storedChat = parsed.data.chatId
    ? await getAssistantChatForUser(user.id, parsed.data.chatId)
    : null
  if (parsed.data.chatId && !storedChat) {
    return NextResponse.json(
      { error: "That chat no longer exists.", code: "chat_missing" },
      { status: 404 }
    )
  }
  const history = storedChat?.messages ?? []

  const modelId = process.env.OPENAI_ASSISTANT_MODEL ?? "gpt-4o-mini"
  // What was last offered in this chat, which the client used to work out and
  // send. It is in the history now, so only the fallback has to come over the
  // wire — the preset the sidebar is sitting on when a chat has no turns yet.
  const lastOfferedCodes = [...history]
    .reverse()
    .find(
      (message) =>
        message.role === "assistant" &&
        message.kind === "presets" &&
        Boolean(message.presets?.length)
    )
    ?.presets?.map((preset) => preset.code)
  const previousPresets = (lastOfferedCodes ?? parsed.data.previousPresetCodes ?? [])
    .map((code) => resolvePresetFromCode(code))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
  const previousPresetContext = buildPreviousPresetContext(previousPresets)
  const livePreset = parsed.data.livePresetCode
    ? resolvePresetFromCode(parsed.data.livePresetCode)
    : null
  const livePresetCode = livePreset ? encodePreset(livePreset) : null
  // A preset named in the request wins over the one currently on screen.
  const lastUserMessage = [...parsed.data.messages]
    .reverse()
    .find((message) => message.role === "user")
  const namedPresetCode = lastUserMessage
    ? extractNamedPresetCode(lastUserMessage.content)
    : null
  // There is always something to render onto: a preset named in the request, the
  // one on screen, or the default. A "show me X" request should never turn into
  // a question about which preset to use.
  const previewPresetCode =
    namedPresetCode ?? livePresetCode ?? encodePreset(DEFAULT_PRESET_CONFIG)
  const livePresetContext = buildLivePresetContext(
    livePresetCode,
    namedPresetCode,
    previewPresetCode
  )

  // Counted against what is stored, plus the turn about to be added: the
  // request no longer carries enough to judge this for itself.
  if (history.length + parsed.data.messages.length + 1 > MAX_CHAT_MESSAGES) {
    return NextResponse.json(
      {
        error:
          "This chat is full. Start a new chat to keep going — this one stays in your history.",
        code: "chat_full",
      },
      { status: 400 }
    )
  }

  const chatMessages = [...history, ...parsed.data.messages].filter((m, i) => {
    if (i === 0 && m.role === "assistant") return false
    return true
  })
  if (!chatMessages.length || chatMessages[0]!.role !== "user") {
    return NextResponse.json(
      { error: "Send a user message first." },
      { status: 400 }
    )
  }

  const system = [
    buildAssistantSystemPrompt(),
    livePresetContext,
    previousPresetContext,
  ]
    .filter((s) => s.trim().length > 0)
    .join("\n\n")

  const turnMessages = chatMessages.map((m) => ({
    role: m.role,
    content: m.content,
  }))

  const askModel = (messages: typeof turnMessages) =>
    generateText({
      model: openai(modelId),
      system,
      messages,
      output: Output.object({
        schema: assistantTurnOutputSchema,
        name: "PresetAssistantTurn",
        description:
          "Gathering: follow-up tap labels, empty presetVariants and previewCode. Ready: 1–4 full facet tuples + captions, empty followUpQuestions and previewCode. Preview: JSX Preview() in previewCode, empty presetVariants and followUpQuestions.",
      }),
      temperature: 0.35,
      maxRetries: 0,
    })

  try {
    const result = await askModel(turnMessages)

    const object = result.output
    if (!object) {
      return NextResponse.json(
        {
          error:
            "The model did not return structured output. Try again or shorten your message.",
          code: "no_output",
        },
        { status: 502 }
      )
    }

    const normalized = normalizeAssistantTurn(object)
    if (!normalized) {
      console.error("[api/assistant] normalize failed", object)
      return NextResponse.json(
        {
          error:
            "Assistant returned an incomplete answer. Please try again or shorten your message.",
        },
        { status: 422 }
      )
    }

    if (normalized.phase === "preview") {
      const preview = await repairPreviewIfNeeded(
        normalized.preview,
        normalized.assistantMessage,
        turnMessages,
        askModel
      )
      const previewTurn: AssistantPreview = {
        phase: "preview",
        assistantMessage: preview.assistantMessage,
        preview: {
          ...preview.preview,
          presetCode: previewPresetCode,
        },
      }
      const persistedMessages = [
        ...chatMessages.map((message) => toPersistedAssistantMessage(message)),
        {
          role: "assistant" as const,
          kind: "preview" as const,
          content: previewTurn.assistantMessage,
          preview: previewTurn.preview,
        },
      ]
      const persisted = await saveAssistantChatForUser({
        user,
        chatId: parsed.data.chatId,
        messages: persistedMessages,
      })
      return NextResponse.json({ ...previewTurn, chatId: persisted.chatId })
    }

    if (normalized.phase === "ready") {
      const ready = encodeReadyPayload(normalized, chatMessages, previousPresets)
      if (ready.presets.length < 1) {
        return NextResponse.json(
          {
            error:
              "Could not produce distinct presets from that answer. Please try again.",
          },
          { status: 422 }
        )
      }
      const persistedMessages = [
        ...chatMessages.map((message) => toPersistedAssistantMessage(message)),
        {
          role: "assistant" as const,
          kind: "presets" as const,
          content: ready.assistantMessage,
          presets: ready.presets,
        },
      ]
      const persisted = await saveAssistantChatForUser({
        user,
        chatId: parsed.data.chatId,
        messages: persistedMessages,
      })
      return NextResponse.json({ ...ready, chatId: persisted.chatId })
    }

    const gatheringTurn = {
      ...normalized,
      followUpQuestions: normalizeQuickReplies(normalized.followUpQuestions),
    }
    const persistedMessages = [
      ...chatMessages.map((message) => toPersistedAssistantMessage(message)),
      {
        role: "assistant" as const,
        kind: "text" as const,
        content: gatheringTurn.assistantMessage,
        followUpQuestions: gatheringTurn.followUpQuestions,
      },
    ]
    const persisted = await saveAssistantChatForUser({
      user,
      chatId: parsed.data.chatId,
      messages: persistedMessages,
    })

    return NextResponse.json({ ...gatheringTurn, chatId: persisted.chatId })
  } catch (err) {
    console.error("[api/assistant]", err)
    const { status, body } = mapProviderError(err)
    return NextResponse.json(body, { status })
  }
}
