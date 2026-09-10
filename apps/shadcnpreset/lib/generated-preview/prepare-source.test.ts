import { describe, expect, it } from "vitest"

import {
  findInvalidVariantProps,
  findUnknownComponents,
  prepareGeneratedPreviewSource,
} from "@/lib/generated-preview/prepare-source"

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

describe("findUnknownComponents", () => {
  const scope = ["Drawer", "DrawerContent", "DrawerHeader", "Button", "Card"]

  it("names a subcomponent the scope does not bind", () => {
    expect(
      findUnknownComponents(
        "<Drawer><DrawerContent><DrawerBody>hi</DrawerBody></DrawerContent></Drawer>",
        scope
      )
    ).toEqual(["DrawerBody"])
  })

  it("passes when every component resolves", () => {
    expect(
      findUnknownComponents("<Card><Button>Go</Button></Card>", scope)
    ).toEqual([])
  })

  it("ignores DOM elements and namespaced members", () => {
    expect(
      findUnknownComponents("<div><span /><Drawer.Trigger /></div>", scope)
    ).toEqual([])
  })

  it("allows components the preview declares itself", () => {
    expect(
      findUnknownComponents(
        "function Row() { return <Button /> }\nconst Preview = () => <Row />",
        scope
      )
    ).toEqual([])
  })
})

describe("findInvalidVariantProps", () => {
  const variants = {
    Button: {
      variant: ["default", "outline", "secondary", "ghost", "destructive", "link"],
      size: ["default", "xs", "sm", "lg", "icon"],
    },
  }

  it("catches sizes that silently render as default", () => {
    const found = findInvalidVariantProps(
      '<Button size="md">Medium</Button><Button size="xl">Extra</Button>',
      variants
    )

    expect(found.map((f) => f.value)).toEqual(["md", "xl"])
    expect(found[0]?.component).toBe("Button")
    expect(found[0]?.prop).toBe("size")
  })

  it("accepts every documented value", () => {
    const code = variants.Button.size
      .map((size) => `<Button size="${size}">x</Button>`)
      .join("")

    expect(findInvalidVariantProps(code, variants)).toEqual([])
  })

  it("ignores props that are not variant enums", () => {
    expect(
      findInvalidVariantProps('<Button className="w-full" type="submit" />', variants)
    ).toEqual([])
  })

  it("ignores components without variants", () => {
    expect(findInvalidVariantProps('<Card size="md" />', variants)).toEqual([])
  })
})
