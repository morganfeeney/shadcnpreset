import * as React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { compileGeneratedPreview } from "@/lib/generated-preview/compile"

const scope = {
  PreviewFrame: ({ children }: { children?: React.ReactNode }) =>
    React.createElement("div", { "data-slot": "preview-frame" }, children),
  DatePicker: () => React.createElement("button", null, "Pick a date"),
}

function render(component: React.ComponentType) {
  return renderToStaticMarkup(React.createElement(component))
}

describe("compileGeneratedPreview", () => {
  it("compiles JSX into a renderable component", () => {
    const result = compileGeneratedPreview(
      `function Preview() {
        return (
          <PreviewFrame>
            <DatePicker />
          </PreviewFrame>
        )
      }`,
      scope
    )

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(render(result.component)).toContain("Pick a date")
  })

  it("supports hooks without an explicit import", () => {
    const result = compileGeneratedPreview(
      `function Preview() {
        const [count] = useState(3)
        return <span>{count}</span>
      }`,
      scope
    )

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(render(result.component)).toContain("3")
  })

  it("strips imports and normalises a default export", () => {
    const result = compileGeneratedPreview(
      `import { DatePicker } from "@/components/cn-ui/date-picker"

       export default function Demo() {
         return <DatePicker />
       }`,
      scope
    )

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(render(result.component)).toContain("Pick a date")
  })

  it("rejects blocked APIs instead of evaluating them", () => {
    const result = compileGeneratedPreview(
      `function Preview() {
        fetch("/api/secret")
        return <div />
      }`,
      scope
    )

    expect(result).toEqual({
      ok: false,
      error: "Generated preview used a blocked API.",
    })
  })

  it("reports a syntax error rather than throwing", () => {
    const result = compileGeneratedPreview(
      "function Preview() { return <div",
      scope
    )

    expect(result.ok).toBe(false)
  })

  it("reports source that never defines Preview", () => {
    const result = compileGeneratedPreview("const value = 1", scope)

    expect(result).toEqual({
      ok: false,
      error: "Generated preview must define a Preview function.",
    })
  })
})
