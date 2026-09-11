import { describe, expect, it } from "vitest"

import {
  findInvalidVariantProps,
  findRawHtmlControls,
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

describe("findRawHtmlControls", () => {
  it("catches a form built from raw HTML", () => {
    // Exactly what was generated for "show a sign-up form": no components at
    // all, so nothing carried the cn-* classes and it rendered as bare text.
    const found = findRawHtmlControls(
      `<form><div><label for="name">Name</label><input id="name" placeholder="Enter your name" /></div><button type="submit">Sign Up</button></form>`
    )

    expect(found.map((f) => f.element)).toEqual(["label", "input", "button"])
  })

  it("reports what to use instead", () => {
    const [first] = findRawHtmlControls('<input placeholder="x" />')

    expect(first?.element).toBe("input")
    expect(first?.use).toContain("Input")
  })

  it("allows layout, text and form wrappers", () => {
    expect(
      findRawHtmlControls(
        '<form><div className="flex gap-2"><span>Total</span><p>Copy</p></div></form>'
      )
    ).toEqual([])
  })

  it("passes a form built from components", () => {
    expect(
      findRawHtmlControls(
        `<Card><Field><FieldLabel>Name</FieldLabel><Input placeholder="Name" /></Field><Button>Sign Up</Button></Card>`
      )
    ).toEqual([])
  })

  it("reports each element once", () => {
    expect(findRawHtmlControls("<input /><input /><input />")).toHaveLength(1)
  })
})
