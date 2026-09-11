import * as React from "react"

import { transform } from "sucrase"

import {
  validateGeneratedPreviewSource,
  type GeneratedPreviewIssue,
} from "@/lib/generated-preview/validate"

export type CompileGeneratedPreviewResult =
  | {
      ok: true
      component: React.ComponentType
    }
  | ({ ok: false } & GeneratedPreviewIssue)

export function compileGeneratedPreview(
  raw: string,
  scope: Record<string, unknown>
): CompileGeneratedPreviewResult {
  // The same checks the server ran before returning this preview. They repeat
  // here because a preview can arrive from anywhere — a stored chat, a shared
  // link, a turn that predates the server-side pass.
  const validated = validateGeneratedPreviewSource(raw, Object.keys(scope))
  if (!validated.ok) return validated

  let transformed: string
  try {
    transformed = transform(validated.code, {
      transforms: ["jsx", "typescript"],
      jsxRuntime: "classic",
      production: true,
    }).code
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Could not compile the generated preview.",
    }
  }

  const scopeKeys = Object.keys(scope)
  const scopeValues = scopeKeys.map((key) => scope[key])

  try {
    const factory = new Function(
      "React",
      ...scopeKeys,
      `"use strict";
const { useState, useEffect, useMemo, useRef, useId, useCallback } = React;
${transformed}
if (typeof Preview !== "function") {
  throw new Error("Preview is not a component.");
}
return Preview;`
    ) as (...args: unknown[]) => React.ComponentType
    const component = factory(React, ...scopeValues)
    return { ok: true, component }
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Could not evaluate the generated preview.",
    }
  }
}
