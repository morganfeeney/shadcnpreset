import * as React from "react"
import { transform } from "sucrase"

import { prepareGeneratedPreviewSource } from "@/lib/generated-preview/prepare-source"

export type CompileGeneratedPreviewResult =
  | {
      ok: true
      component: React.ComponentType
    }
  | {
      ok: false
      error: string
    }

export function compileGeneratedPreview(
  raw: string,
  scope: Record<string, unknown>
): CompileGeneratedPreviewResult {
  const prepared = prepareGeneratedPreviewSource(raw)
  if (!prepared.ok) return prepared

  let transformed: string
  try {
    transformed = transform(prepared.code, {
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
