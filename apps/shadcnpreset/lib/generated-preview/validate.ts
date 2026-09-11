import { transform } from "sucrase"

import { GENERATED_PREVIEW_COMPONENT_VARIANTS } from "@/lib/generated-preview/catalog"
import {
  findClosedOverlay,
  findMissingChildren,
  findMissingProviders,
  findMisusedAsChild,
  findEmptyComponents,
  findStretchedControls,
  findUngroupedFields,
  findInvalidCompositions,
  findInvalidVariantProps,
  findRawHtmlControls,
  findUnknownComponents,
  prepareGeneratedPreviewSource,
  type InvalidComposition,
  type MissingChild,
  type MissingProvider,
  type InvalidVariantProp,
  type RawHtmlControl,
} from "@/lib/generated-preview/prepare-source"

/**
 * Everything wrong with a preview that can be seen without rendering it.
 *
 * Carried as data rather than a sentence so the server can describe the
 * problem back to the model precisely — the names it invented, the values it
 * should have used — instead of asking it to guess from prose.
 */
export type GeneratedPreviewIssue = {
  error: string
  /** Component names the preview used that the scope does not provide. */
  unknownComponents?: string[]
  /** The real members of the families those invented names were reaching for. */
  unknownFamilies?: Array<{ prefix: string; names: string[] }>
  /** Variant props set to a value the component does not define. */
  invalidProps?: InvalidVariantProp[]
  /** Raw HTML controls used where a scope component exists. */
  rawControls?: RawHtmlControl[]
  /** Children placed under a parent that does not accept them. */
  invalidCompositions?: InvalidComposition[]
  /** An overlay the preview is about that would render closed. */
  closedOverlay?: string
  /** Components given `asChild`, which nothing here accepts. */
  misusedAsChild?: string[]
  /** Controls a vertical Field would stretch to full width. */
  stretchedControls?: string[]
  /** Sibling fields with no FieldGroup to space them apart. */
  ungroupedFields?: boolean
  /** Components written with no content, which render as empty boxes. */
  emptyComponents?: string[]
  /** Parts used without the root that supplies their context. */
  missingProviders?: MissingProvider[]
  /** Wrappers holding only text, where the child does the styling. */
  missingChildren?: MissingChild[]
}

export type ValidateGeneratedPreviewResult =
  | { ok: true; code: string }
  | ({ ok: false } & GeneratedPreviewIssue)

/**
 * The real components an invented name was reaching for.
 *
 * `SidebarMenuGroup` and `SidebarTitle` do not exist; `SidebarGroup` and
 * `SidebarGroupLabel` do, and sit beside them in the same family. Told only
 * that a name is unavailable, the model has 251 of them to choose from and
 * invents a neighbour again. Told what the family actually contains, it has
 * the answer in front of it.
 *
 * Keyed on the first word of the name, which is what the model got right.
 */
function familiesFor(
  unknown: string[],
  scopeNames: Iterable<string>
): Array<{ prefix: string; names: string[] }> {
  const all = [...scopeNames]
  const byPrefix = new Map<string, string[]>()

  for (const name of unknown) {
    const prefix = /^[A-Z][a-z]+/.exec(name)?.[0]
    if (!prefix || byPrefix.has(prefix)) continue
    const names = all.filter((candidate) => candidate.startsWith(prefix))
    if (names.length) byPrefix.set(prefix, names)
  }

  return [...byPrefix].map(([prefix, names]) => ({ prefix, names }))
}

/**
 * Checks a generated preview without running it.
 *
 * Pure string work — no DOM, no React — so the same checks the renderer makes
 * can run on the server, before the turn is ever returned. That is the point:
 * a preview that cannot render is worth catching while the model is still in a
 * position to fix it.
 */
export function validateGeneratedPreviewSource(
  raw: string,
  scopeNames: Iterable<string>
): ValidateGeneratedPreviewResult {
  const prepared = prepareGeneratedPreviewSource(raw)
  if (!prepared.ok) return prepared

  const unknownComponents = findUnknownComponents(prepared.code, scopeNames)
  if (unknownComponents.length) {
    return {
      ok: false,
      error: `This preview uses ${unknownComponents.join(", ")}, which ${
        unknownComponents.length === 1 ? "is" : "are"
      } not available here.`,
      unknownComponents,
      unknownFamilies: familiesFor(unknownComponents, scopeNames),
    }
  }

  const rawControls = findRawHtmlControls(prepared.code)
  if (rawControls.length) {
    const detail = rawControls
      .map(({ element, use }) => `<${element}> (use ${use})`)
      .join("; ")
    return {
      ok: false,
      error: `This preview uses raw HTML controls, which the preset cannot style: ${detail}.`,
      rawControls,
    }
  }

  const invalidProps = findInvalidVariantProps(
    prepared.code,
    GENERATED_PREVIEW_COMPONENT_VARIANTS
  )
  if (invalidProps.length) {
    const detail = invalidProps
      .map(
        ({ component, prop, value, allowed }) =>
          `${component} ${prop}="${value}" (use ${allowed.join(", ")})`
      )
      .join("; ")
    return {
      ok: false,
      error: `This preview sets a variant that does not exist: ${detail}.`,
      invalidProps,
    }
  }

  const invalidCompositions = findInvalidCompositions(prepared.code)
  if (invalidCompositions.length) {
    const detail = invalidCompositions
      .map(
        ({ parent, child, use }) => `${child} inside ${parent} (use ${use})`
      )
      .join("; ")
    return {
      ok: false,
      error: `This preview nests a component where it does not belong: ${detail}.`,
      invalidCompositions,
    }
  }

  const stretchedControls = findStretchedControls(prepared.code)
  if (stretchedControls.length) {
    return {
      ok: false,
      error: `This preview puts ${stretchedControls.join(", ")} in a vertical Field, which stretches ${
        stretchedControls.length === 1 ? "it" : "them"
      } to full width.`,
      stretchedControls,
    }
  }

  const missingChildren = findMissingChildren(prepared.code)
  if (missingChildren.length) {
    const detail = missingChildren
      .map(({ parent, required }) => `${parent} without a ${required}`)
      .join("; ")
    return {
      ok: false,
      error: `This preview leaves a wrapper to do a child's job: ${detail}.`,
      missingChildren,
    }
  }

  const missingProviders = findMissingProviders(prepared.code)
  if (missingProviders.length) {
    const detail = missingProviders
      .map(({ component, root }) => `${component} without a ${root}`)
      .join("; ")
    return {
      ok: false,
      error: `This preview would throw on render: ${detail}.`,
      missingProviders,
    }
  }

  const emptyComponents = findEmptyComponents(prepared.code)
  if (emptyComponents.length) {
    return {
      ok: false,
      error: `This preview leaves ${emptyComponents.join(", ")} empty, so ${
        emptyComponents.length === 1 ? "it renders" : "they render"
      } as blank boxes.`,
      emptyComponents,
    }
  }

  if (findUngroupedFields(prepared.code)) {
    return {
      ok: false,
      error:
        "This preview puts several Fields side by side with no FieldGroup, so they stack with no space between them.",
      ungroupedFields: true,
    }
  }

  const misusedAsChild = findMisusedAsChild(prepared.code)
  if (misusedAsChild.length) {
    return {
      ok: false,
      error: `This preview passes asChild to ${misusedAsChild.join(", ")}, which ${
        misusedAsChild.length === 1 ? "does" : "do"
      } not accept it.`,
      misusedAsChild,
    }
  }

  const closedOverlay = findClosedOverlay(prepared.code)
  if (closedOverlay) {
    return {
      ok: false,
      error: `This preview shows a ${closedOverlay} that starts closed, so nothing but its trigger would appear.`,
      closedOverlay,
    }
  }

  // Compiling is the only way to know the JSX parses. The output is thrown
  // away — the renderer transforms the prepared source itself — but a syntax
  // error caught here is one the user never sees.
  try {
    transform(prepared.code, {
      transforms: ["jsx", "typescript"],
      jsxRuntime: "classic",
      production: true,
    })
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Could not compile the generated preview.",
    }
  }

  return { ok: true, code: prepared.code }
}

/**
 * The issue, written as an instruction for the model to act on.
 *
 * States the failure and what to do about it, then repeats the constraint it
 * broke. Naming the specific identifiers matters more than the prose: the
 * repair turn carries the whole system prompt already, and what it lacked the
 * first time was not the rule but the knowledge that it had broken it.
 */
export function describeGeneratedPreviewIssue(
  issue: GeneratedPreviewIssue
): string {
  const lines = [
    `The preview you just returned cannot be rendered: ${issue.error}`,
    "Return the same preview with that fixed, and change nothing else about what it shows.",
  ]

  if (issue.unknownComponents?.length) {
    lines.push(
      `${issue.unknownComponents.join(", ")} ${
        issue.unknownComponents.length === 1 ? "is" : "are"
      } not in scope. Use the real ones, or drop that part.`
    )
    for (const { prefix, names } of issue.unknownFamilies ?? []) {
      lines.push(`Everything named ${prefix}*: ${names.join(", ")}.`)
    }
    lines.push(
      "That list is the whole family — if none of it does what you wanted, the component does not exist. Use the nearest one that does, or plain text in a `<div>`. Do not reach for another name."
    )
  }

  if (issue.rawControls?.length) {
    lines.push(
      `Replace each raw control with its component: ${issue.rawControls
        .map(({ element, use }) => `<${element}> → ${use}`)
        .join("; ")}.`
    )
  }

  if (issue.invalidCompositions?.length) {
    lines.push(
      `Swap each of these for the component meant for that slot: ${issue.invalidCompositions
        .map(
          ({ parent, child, use }) => `${child} inside ${parent} → ${use}`
        )
        .join("; ")}. The parent already draws the border, background and radius; the wrong child draws its own on top.`
    )
  }

  if (issue.stretchedControls?.length) {
    lines.push(
      `A Field is \`flex-col *:w-full\` by default, so ${issue.stretchedControls.join(", ")} ${
        issue.stretchedControls.length === 1 ? "is" : "are"
      } stretched edge to edge. ${
        issue.stretchedControls.length === 1 ? "It sits" : "They sit"
      } beside the label instead: \`<Field orientation="horizontal"><FieldLabel htmlFor="x">…</FieldLabel><Switch id="x" /></Field>\`. Do not put the control inside a \`FieldContent\` — that is the text column, for a \`FieldTitle\` and \`FieldDescription\`; the control is its sibling.`
    )
  }

  if (issue.missingChildren?.length) {
    lines.push(
      `${issue.missingChildren
        .map(
          ({ parent, required }) =>
            `${parent} styles nothing on its own — its label belongs in a ${required}`
        )
        .join("; ")}. Left bare, the text renders at body size with no padding, no hover and no active state.`
    )
  }

  if (issue.missingProviders?.length) {
    lines.push(
      `${issue.missingProviders
        .map(
          ({ component, root }) =>
            `${component} reads context from ${root}, which this preview never renders`
        )
        .join("; ")}. Wrap the whole thing in the root — without it the preview throws rather than rendering.`
    )
  }

  if (issue.emptyComponents?.length) {
    lines.push(
      `${issue.emptyComponents.join(", ")} render${
        issue.emptyComponents.length === 1 ? "s" : ""
      } whatever you put inside, and ${
        issue.emptyComponents.length === 1 ? "was" : "were"
      } given nothing. If you wanted an on/off setting, that is a \`Switch\` — a \`Toggle\` is a pressable button and needs an icon or a word in it.`
    )
  }

  if (issue.ungroupedFields) {
    lines.push(
      "The gap between fields comes from their container, not the field: wrap them in a \`FieldGroup\`. A \`Field\`'s own spacing is only between its label and its control."
    )
  }

  if (issue.misusedAsChild?.length) {
    lines.push(
      `${issue.misusedAsChild.join(", ")} compose through a \`render\` prop, not \`asChild\` — nothing here takes \`asChild\`. Write \`<SheetTrigger render={<Button variant="outline" />}>Open</SheetTrigger>\`: the element goes in \`render\`, its content stays as children. Left as \`asChild\`, the trigger draws its own button around yours.`
    )
  }

  if (issue.closedOverlay) {
    lines.push(
      `Add \`defaultOpen\` to the ${issue.closedOverlay} so the preview opens with it showing. Keep the trigger — it is part of the demo — but the point of the preview is to see what is inside.`
    )
  }

  if (issue.invalidProps?.length) {
    lines.push(
      `These props have no such value: ${issue.invalidProps
        .map(
          ({ component, prop, value, allowed }) =>
            `${component} ${prop}="${value}" (allowed: ${allowed.join(", ")})`
        )
        .join("; ")}.`
    )
  }

  return lines.join("\n")
}
