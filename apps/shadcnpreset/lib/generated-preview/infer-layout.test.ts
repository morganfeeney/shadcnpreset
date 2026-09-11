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

  it("classes a card of fields as a form", () => {
    // Full-width inputs leave the card with no intrinsic width, so it needs the
    // form column rather than plain centring, which truncated the fields.
    expect(
      inferPreviewLayout(
        `<PreviewFrame><Card className="w-[340px]"><CardHeader><CardTitle>Create an account</CardTitle></CardHeader><CardContent><FieldGroup><Field><FieldLabel>Name</FieldLabel><Input /></Field><Field><FieldLabel>Email</FieldLabel><Input /></Field><Field><FieldLabel>Password</FieldLabel><Input /></Field><Field><Checkbox /><FieldLabel>Terms</FieldLabel></Field></FieldGroup></CardContent><CardFooter><Button>Sign Up</Button></CardFooter></Card></PreviewFrame>`
      )
    ).toBe("form")
  })

  it("keeps a self-sizing component as single", () => {
    expect(
      inferPreviewLayout(
        `<PreviewFrame><Card><CardHeader><CardTitle>Total</CardTitle></CardHeader><CardContent><Badge>Live</Badge></CardContent></Card></PreviewFrame>`
      )
    ).toBe("single")
  })

  it("ignores a list nested inside one component", () => {
    // Rows mapped inside a table are that component's internals.
    expect(
      inferPreviewLayout(
        `<PreviewFrame><Card><CardContent><Table><TableBody>{rows.map(r => <TableRow key={r} />)}</TableBody></Table></CardContent></Card></PreviewFrame>`
      )
    ).toBe("single")
  })
})

describe("lists of rows", () => {
  it("gives an Item list its own column", () => {
    expect(
      inferPreviewLayout(`<PreviewFrame>
        <ItemGroup>
          {members.map((m) => (
            <Item key={m.name} variant="outline">
              <ItemMedia><Avatar /></ItemMedia>
              <ItemContent><ItemTitle>{m.name}</ItemTitle></ItemContent>
              <ItemActions><Button size="sm">Remove</Button></ItemActions>
            </Item>
          ))}
        </ItemGroup>
      </PreviewFrame>`)
    ).toBe("list")
  })

  it("does not mistake ItemMedia alone for a list", () => {
    expect(
      inferPreviewLayout(`<PreviewFrame>
        <Card><CardContent>Just a card</CardContent></Card>
      </PreviewFrame>`)
    ).toBe("single")
  })

  it("still calls a whole screen a page", () => {
    expect(
      inferPreviewLayout(`<PreviewFrame>
        <SidebarProvider>
          <ItemGroup><Item>One</Item></ItemGroup>
        </SidebarProvider>
      </PreviewFrame>`)
    ).toBe("page")
  })
})

describe("markup that lays itself out", () => {
  it("gives a table a bounded column instead of the whole canvas", () => {
    expect(
      inferPreviewLayout(`<PreviewFrame>
        <Table>
          <TableHeader><TableRow><TableHead>Invoice</TableHead></TableRow></TableHeader>
          <TableBody>{rows.map((r) => (<TableRow key={r.id}><TableCell>{r.id}</TableCell></TableRow>))}</TableBody>
        </Table>
      </PreviewFrame>`)
    ).toBe("wide")
  })

  it("leaves a table nested inside a card alone", () => {
    expect(
      inferPreviewLayout(`<PreviewFrame>
        <Card><CardContent><Table><TableBody /></Table></CardContent></Card>
      </PreviewFrame>`)
    ).toBe("single")
  })

  it("gives a grid root a width to divide", () => {
    expect(
      inferPreviewLayout(`<PreviewFrame>
        <div className="grid grid-cols-2 gap-4">
          <Card><CardContent><Skeleton className="h-20" /></CardContent></Card>
          <Card><CardContent><Skeleton className="h-20" /></CardContent></Card>
          <Card><CardContent><Skeleton className="h-20" /></CardContent></Card>
        </div>
      </PreviewFrame>`)
    ).toBe("wide")
  })

  it("keeps a grid root out of the wrapping row", () => {
    expect(
      inferPreviewLayout(`<PreviewFrame>
        <div className="grid grid-cols-3 gap-3">
          <Card>1</Card><Card>2</Card><Card>3</Card><Card>4</Card><Card>5</Card>
        </div>
      </PreviewFrame>`)
    ).toBe("wide")
  })

  it("ignores a grid nested below the root", () => {
    expect(
      inferPreviewLayout(`<PreviewFrame>
        <Card><CardContent><div className="grid grid-cols-2">a</div></CardContent></Card>
      </PreviewFrame>`)
    ).toBe("single")
  })
})
