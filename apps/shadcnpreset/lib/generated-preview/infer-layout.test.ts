import { describe, expect, it } from "vitest"

import { inferPreviewLayout } from "@/lib/generated-preview/infer-layout"

describe("inferPreviewLayout", () => {
  it("treats one component as single", () => {
    expect(
      inferPreviewLayout(
        `<PreviewFrame><Card><CardHeader><CardTitle>Book</CardTitle></CardHeader><CardContent><DatePicker /></CardContent></Card></PreviewFrame>`
      )
    ).toBe("single")
  })

  it("treats a set of repeated items as a gallery", () => {
    expect(
      inferPreviewLayout(
        `<PreviewFrame><div className="flex gap-4"><Button>a</Button><Button>b</Button><Button>c</Button><Button>d</Button></div></PreviewFrame>`
      )
    ).toBe("gallery")
  })

  it("treats a mapped list as a gallery", () => {
    expect(
      inferPreviewLayout(
        `<PreviewFrame><div className="flex gap-4">{variants.map(v => <Button key={v} variant={v}>{v}</Button>)}</div></PreviewFrame>`
      )
    ).toBe("gallery")
  })

  it("treats a repeated set in a column as a stack", () => {
    expect(
      inferPreviewLayout(
        `<PreviewFrame><div className="flex flex-col gap-3">{levels.map(l => <Alert key={l}>{l}</Alert>)}</div></PreviewFrame>`
      )
    ).toBe("stack")
  })

  it("treats a sidebar composition as a page", () => {
    expect(
      inferPreviewLayout(
        `<PreviewFrame><SidebarProvider><Sidebar>nav</Sidebar><main>content</main></SidebarProvider></PreviewFrame>`
      )
    ).toBe("page")
  })

  it("treats a viewport-sized root as a page", () => {
    expect(
      inferPreviewLayout(
        `<PreviewFrame><div className="min-h-screen w-full"><Card>Login</Card></div></PreviewFrame>`
      )
    ).toBe("page")
  })

  it("keeps a card containing a button row as single", () => {
    // Outermost structure decides.
    expect(
      inferPreviewLayout(
        `<PreviewFrame><Card><CardFooter><Button>Cancel</Button><Button>Save</Button></CardFooter></Card></PreviewFrame>`
      )
    ).toBe("single")
  })

  it("works without a PreviewFrame wrapper", () => {
    expect(
      inferPreviewLayout(
        `<div className="flex gap-2"><Badge>a</Badge><Badge>b</Badge><Badge>c</Badge><Badge>d</Badge></div>`
      )
    ).toBe("gallery")
  })
})
