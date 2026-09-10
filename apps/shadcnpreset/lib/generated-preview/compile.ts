import * as React from "react"

import type { InvalidVariantProp } from "@/lib/generated-preview/prepare-source"
import { transform } from "sucrase"

import { GENERATED_PREVIEW_COMPONENT_VARIANTS } from "@/lib/generated-preview/catalog"
import {
  findInvalidVariantProps,
  findUnknownComponents,
  prepareGeneratedPreviewSource,
} from "@/lib/generated-preview/prepare-source"

export type CompileGeneratedPreviewResult =
  | {
      ok: true
      component: React.ComponentType
    }
  | {
      ok: false
      error: string
      /** Component names the preview used that the scope does not provide. */
      unknownComponents?: string[]
      /** Variant props set to a value the component does not define. */
      invalidProps?: InvalidVariantProp[]
    }

export function compileGeneratedPreview(
  raw: string,
  scope: Record<string, unknown>
): CompileGeneratedPreviewResult {
  const prepared = prepareGeneratedPreviewSource(raw)
  if (!prepared.ok) return prepared

  const unknownComponents = findUnknownComponents(
    prepared.code,
    Object.keys(scope)
  )
  if (unknownComponents.length) {
    return {
      ok: false,
      error: `This preview uses ${unknownComponents.join(", ")}, which ${
        unknownComponents.length === 1 ? "is" : "are"
      } not available here.`,
      unknownComponents,
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
