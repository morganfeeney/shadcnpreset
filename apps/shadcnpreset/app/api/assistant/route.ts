import { openai } from "@ai-sdk/openai"
import { generateText, Output } from "ai"
import {
  DEFAULT_PRESET_CONFIG,
  encodePreset,
  type PresetConfig,
} from "shadcn/preset"
import { NextResponse } from "next/server"
import { z } from "zod"

import { saveAssistantChatForUser } from "@/lib/assistant-chat-store"
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
    .max(32),
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
async function repairPreviewIfNeeded(
  preview: NormalizedPreview,
  assistantMessage: string,
  messages: TurnMessage[],
  askModel: (messages: TurnMessage[]) => ReturnType<typeof generateText>
): Promise<{ preview: NormalizedPreview; assistantMessage: string }> {
  const issue = validateGeneratedPreviewSource(
    preview.code,
    GENERATED_PREVIEW_COMPONENT_NAMES
  )
  if (issue.ok) return { preview, assistantMessage }

  console.warn("[api/assistant] repairing preview", {
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
  })

  try {
    const retry = await askModel([
      ...messages,
      { role: "assistant", content: preview.code },
      { role: "user", content: describeGeneratedPreviewIssue(issue) },
    ])
    const repaired = retry.output ? normalizeAssistantTurn(retry.output) : null
    if (repaired?.phase !== "preview") return { preview, assistantMessage }

    // Only take the repair if it actually renders. A second broken preview is
    // no better than the first, and the first at least matches what was asked.
    const recheck = validateGeneratedPreviewSource(
      repaired.preview.code,
      GENERATED_PREVIEW_COMPONENT_NAMES
    )
    if (!recheck.ok) {
      console.warn("[api/assistant] preview repair failed", {
        error: recheck.error,
      })
      return { preview, assistantMessage }
    }

    return {
      preview: { ...repaired.preview, title: preview.title },
      assistantMessage,
    }
  } catch (error) {
    console.warn("[api/assistant] preview repair errored", error)
    return { preview, assistantMessage }
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
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const modelId = process.env.OPENAI_ASSISTANT_MODEL ?? "gpt-4o-mini"
  const previousPresets = (parsed.data.previousPresetCodes ?? [])
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

  const chatMessages = parsed.data.messages.filter((m, i) => {
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
