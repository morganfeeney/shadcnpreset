import { describe, expect, it } from "vitest"

import { prepareGeneratedPreviewSource } from "@/lib/generated-preview/prepare-source"

describe("prepareGeneratedPreviewSource", () => {
  it("wraps bare JSX in Preview", () => {
    const result = prepareGeneratedPreviewSource("<DatePicker />")
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.code).toContain("function Preview()")
      expect(result.code).toContain("<DatePicker />")
    }
  })

  it("strips imports and keeps Preview", () => {
    const result = prepareGeneratedPreviewSource(`
import { DatePicker } from "@/components/ui/date-picker"

export default function Preview() {
  return <DatePicker />
}
`)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.code).not.toContain("import")
      expect(result.code).toContain("function Preview()")
    }
  })

  it("rejects blocked APIs", () => {
    const result = prepareGeneratedPreviewSource(`
function Preview() {
  fetch("/api/secret")
  return <div />
}
`)
    expect(result.ok).toBe(false)
  })

  it.each([
    ["storage", 'function Preview() { localStorage.getItem("session"); return <div /> }'],
    ["raw html", "function Preview() { return <div dangerouslySetInnerHTML={{ __html: html }} /> }"],
    ["frame escape", "function Preview() { window.parent.location.reload(); return <div /> }"],
    ["indirect eval", 'function Preview() { const f = [].constructor; return <div /> }'],
  ])("rejects %s", (_label, source) => {
    expect(prepareGeneratedPreviewSource(source)).toEqual({
      ok: false,
      error: "Generated preview used a blocked API.",
    })
  })

  it("rejects an empty preview", () => {
    expect(prepareGeneratedPreviewSource("   ")).toEqual({
      ok: false,
      error: "Generated preview was empty.",
    })
  })
})
