import { describe, expect, it } from "vitest"

import { GENERATED_PREVIEW_COMPONENT_NAMES } from "@/lib/generated-preview/catalog"
import { buildAssistantSystemPrompt } from "@/lib/search/assistant/system-prompt"
import {
  describeGeneratedPreviewIssue,
  validateGeneratedPreviewSource,
} from "@/lib/generated-preview/validate"

const scope = [
  "PreviewFrame",
  "SidebarMenuItem",
  "SidebarMenuButton",
  "SidebarGroup",
  "SidebarGroupLabel",
  "Sidebar",
  "SidebarProvider",
  "SidebarContent",
  "SidebarGroup",
  "SidebarMenu",
  "SidebarMenuButton",
  "SidebarFooter",
  "ChartContainer",
  "ChartTooltip",
  "Toggle",
  "FieldTitle",
  "Sheet",
  "SheetContent",
  "SheetHeader",
  "SheetTitle",
  "SheetFooter",
  "FieldContent",
  "FieldTitle",
  "FieldDescription",
  "RadioGroup",
  "RadioGroupItem",
  "Switch",
  "Avatar",
  "Slider",
  "FieldGroup",
  "Sheet",
  "SheetTrigger",
  "SheetContent",
  "DrawerClose",
  "Drawer",
  "DrawerTrigger",
  "DrawerContent",
  "DrawerHeader",
  "DrawerTitle",
  "DropdownMenu",
  "DropdownMenuTrigger",
  "DropdownMenuContent",
  "SidebarProvider",
  "Checkbox",
  "Field",
  "Card",
  "Button",
  "Input",
  "InputGroup",
  "InputGroupAddon",
  "InputGroupInput",
  "InputGroupText",
  "FieldLabel",
  "DatePicker",
]

describe("validateGeneratedPreviewSource", () => {
  it("accepts a preview built from components in scope", () => {
    const result = validateGeneratedPreviewSource(
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
    expect(result.code).toContain("function Preview")
  })

  it("offers the real family behind an invented name", () => {
    const result = validateGeneratedPreviewSource(
      `function Preview() {
        return (
          <PreviewFrame>
            <SidebarProvider>
              <Sidebar>
                <SidebarMenuGroup><SidebarMenuButton>Home</SidebarMenuButton></SidebarMenuGroup>
              </Sidebar>
            </SidebarProvider>
          </PreviewFrame>
        )
      }`,
      scope
    )

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.unknownComponents).toEqual(["SidebarMenuGroup"])
    const family = result.unknownFamilies?.[0]
    expect(family?.prefix).toBe("Sidebar")
    expect(family?.names).toContain("SidebarGroup")
    expect(family?.names).not.toContain("SidebarMenuGroup")
  })

  it("names the components that are not in scope", () => {
    const result = validateGeneratedPreviewSource(
      `function Preview() {
        return (
          <PreviewFrame>
            <DrawerBody><Button>Go</Button></DrawerBody>
          </PreviewFrame>
        )
      }`,
      scope
    )

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.unknownComponents).toEqual(["DrawerBody"])
  })

  it("rejects raw HTML controls the preset cannot style", () => {
    const result = validateGeneratedPreviewSource(
      `function Preview() {
        return (
          <PreviewFrame>
            <input placeholder="Email" />
          </PreviewFrame>
        )
      }`,
      scope
    )

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.rawControls).toEqual([
      { element: "input", use: "Input (or Checkbox, Switch, RadioGroup)" },
    ])
  })

  it("rejects a variant value the component does not define", () => {
    const result = validateGeneratedPreviewSource(
      `function Preview() {
        return (
          <PreviewFrame>
            <Button size="md">Save</Button>
          </PreviewFrame>
        )
      }`,
      scope
    )

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.invalidProps?.[0]).toMatchObject({
      component: "Button",
      prop: "size",
      value: "md",
    })
  })

  it("rejects a plain Input inside an InputGroup", () => {
    const result = validateGeneratedPreviewSource(
      `function Preview() {
        return (
          <PreviewFrame>
            <InputGroup>
              <InputGroupAddon><InputGroupText>$</InputGroupText></InputGroupAddon>
              <Input placeholder="0.00" />
            </InputGroup>
          </PreviewFrame>
        )
      }`,
      scope
    )

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.invalidCompositions).toEqual([
      { parent: "InputGroup", child: "Input", use: "InputGroupInput" },
    ])
  })

  it("accepts the group's own control", () => {
    const result = validateGeneratedPreviewSource(
      `function Preview() {
        return (
          <PreviewFrame>
            <InputGroup>
              <InputGroupAddon><InputGroupText>$</InputGroupText></InputGroupAddon>
              <InputGroupInput placeholder="0.00" />
            </InputGroup>
          </PreviewFrame>
        )
      }`,
      scope
    )

    expect(result.ok).toBe(true)
  })

  it("leaves a control nested deeper than a direct child alone", () => {
    const result = validateGeneratedPreviewSource(
      `function Preview() {
        return (
          <PreviewFrame>
            <Card>
              <Input placeholder="Search" />
            </Card>
          </PreviewFrame>
        )
      }`,
      scope
    )

    expect(result.ok).toBe(true)
  })

  it("tracks nesting through a prop containing an arrow function", () => {
    const result = validateGeneratedPreviewSource(
      `function Preview() {
        const [value, setValue] = useState("")
        return (
          <PreviewFrame>
            <InputGroup>
              <Input value={value} onChange={(e) => setValue(e.target.value)} />
            </InputGroup>
          </PreviewFrame>
        )
      }`,
      scope
    )

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.invalidCompositions?.[0]?.child).toBe("Input")
  })

  it("rejects an overlay the preview is about that starts closed", () => {
    const result = validateGeneratedPreviewSource(
      `function Preview() {
        return (
          <PreviewFrame>
            <Drawer>
              <DrawerTrigger><Button>Filters</Button></DrawerTrigger>
              <DrawerContent>
                <DrawerHeader><DrawerTitle>Filters</DrawerTitle></DrawerHeader>
                <Field orientation="horizontal">
                  <FieldLabel htmlFor="in-stock">In stock</FieldLabel>
                  <Checkbox id="in-stock" />
                </Field>
              </DrawerContent>
            </Drawer>
          </PreviewFrame>
        )
      }`,
      scope
    )

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.closedOverlay).toBe("Drawer")
  })

  it("accepts an overlay that opens itself", () => {
    const result = validateGeneratedPreviewSource(
      `function Preview() {
        return (
          <PreviewFrame>
            <Drawer defaultOpen>
              <DrawerTrigger><Button>Filters</Button></DrawerTrigger>
              <DrawerContent><DrawerTitle>Filters</DrawerTitle></DrawerContent>
            </Drawer>
          </PreviewFrame>
        )
      }`,
      scope
    )

    expect(result.ok).toBe(true)
  })

  it("leaves an overlay inside a whole screen closed", () => {
    const result = validateGeneratedPreviewSource(
      `function Preview() {
        return (
          <PreviewFrame>
            <SidebarProvider>
              <DropdownMenu>
                <DropdownMenuTrigger><Button>Account</Button></DropdownMenuTrigger>
                <DropdownMenuContent>Settings</DropdownMenuContent>
              </DropdownMenu>
            </SidebarProvider>
          </PreviewFrame>
        )
      }`,
      scope
    )

    expect(result.ok).toBe(true)
  })

  it("rejects asChild on a base-ui component", () => {
    const result = validateGeneratedPreviewSource(
      `function Preview() {
        return (
          <PreviewFrame>
            <Sheet defaultOpen>
              <SheetTrigger asChild><Button>Open</Button></SheetTrigger>
              <SheetContent>Settings</SheetContent>
            </Sheet>
          </PreviewFrame>
        )
      }`,
      scope
    )

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.misusedAsChild).toEqual(["SheetTrigger"])
  })

  it("rejects asChild on the drawer too, now that it is base-ui", () => {
    const result = validateGeneratedPreviewSource(
      `function Preview() {
        return (
          <PreviewFrame>
            <Drawer defaultOpen>
              <DrawerTrigger asChild><Button>Filters</Button></DrawerTrigger>
              <DrawerContent>Filters</DrawerContent>
            </Drawer>
          </PreviewFrame>
        )
      }`,
      scope
    )

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.misusedAsChild).toEqual(["DrawerTrigger"])
  })

  it("accepts the render prop base-ui actually uses", () => {
    const result = validateGeneratedPreviewSource(
      `function Preview() {
        return (
          <PreviewFrame>
            <Sheet defaultOpen>
              <SheetTrigger render={<Button variant="outline" />}>Open</SheetTrigger>
              <SheetContent>Settings</SheetContent>
            </Sheet>
          </PreviewFrame>
        )
      }`,
      scope
    )

    expect(result.ok).toBe(true)
  })

  it("rejects a switch a vertical Field would stretch", () => {
    const result = validateGeneratedPreviewSource(
      `function Preview() {
        return (
          <PreviewFrame>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email Notifications</FieldLabel>
                <Switch id="email" />
              </Field>
            </FieldGroup>
          </PreviewFrame>
        )
      }`,
      scope
    )

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.stretchedControls).toEqual(["Switch"])
  })

  it("accepts the same switch in a horizontal Field", () => {
    const result = validateGeneratedPreviewSource(
      `function Preview() {
        return (
          <PreviewFrame>
            <Field orientation="horizontal">
              <FieldLabel htmlFor="email">Email Notifications</FieldLabel>
              <Switch id="email" />
            </Field>
          </PreviewFrame>
        )
      }`,
      scope
    )

    expect(result.ok).toBe(true)
  })

  it("catches the avatar case too", () => {
    const result = validateGeneratedPreviewSource(
      `function Preview() {
        return (
          <PreviewFrame>
            <Field>
              <FieldLabel>Avatar</FieldLabel>
              <Avatar />
            </Field>
          </PreviewFrame>
        )
      }`,
      scope
    )

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.stretchedControls).toEqual(["Avatar"])
  })

  it("leaves controls that should be full width alone", () => {
    const result = validateGeneratedPreviewSource(
      `function Preview() {
        return (
          <PreviewFrame>
            <Field>
              <FieldLabel htmlFor="volume">Volume</FieldLabel>
              <Slider id="volume" />
            </Field>
          </PreviewFrame>
        )
      }`,
      scope
    )

    expect(result.ok).toBe(true)
  })

  it("catches a control buried in a FieldContent", () => {
    const result = validateGeneratedPreviewSource(
      `function Preview() {
        return (
          <PreviewFrame>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email Notifications</FieldLabel>
                <FieldContent>
                  <Switch id="email" />
                </FieldContent>
              </Field>
            </FieldGroup>
          </PreviewFrame>
        )
      }`,
      scope
    )

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.stretchedControls).toEqual(["Switch"])
  })

  it("accepts a control beside a FieldContent in a horizontal row", () => {
    const result = validateGeneratedPreviewSource(
      `function Preview() {
        return (
          <PreviewFrame>
            <Field orientation="horizontal">
              <FieldContent>
                <FieldTitle>Standard delivery</FieldTitle>
                <FieldDescription>25-35 min</FieldDescription>
              </FieldContent>
              <RadioGroupItem value="asap" id="asap" />
            </Field>
          </PreviewFrame>
        )
      }`,
      scope
    )

    expect(result.ok).toBe(true)
  })

  it("rejects sibling fields with no FieldGroup to space them", () => {
    const result = validateGeneratedPreviewSource(
      `function Preview() {
        return (
          <PreviewFrame>
            <div className="flex-1 overflow-y-auto p-4">
              <Field orientation="horizontal">
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Switch id="email" />
              </Field>
              <Field orientation="horizontal">
                <FieldLabel htmlFor="sms">SMS</FieldLabel>
                <Switch id="sms" />
              </Field>
            </div>
          </PreviewFrame>
        )
      }`,
      scope
    )

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.ungroupedFields).toBe(true)
  })

  it("accepts the same fields inside a FieldGroup", () => {
    const result = validateGeneratedPreviewSource(
      `function Preview() {
        return (
          <PreviewFrame>
            <FieldGroup className="p-4">
              <Field orientation="horizontal">
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Switch id="email" />
              </Field>
              <Field orientation="horizontal">
                <FieldLabel htmlFor="sms">SMS</FieldLabel>
                <Switch id="sms" />
              </Field>
            </FieldGroup>
          </PreviewFrame>
        )
      }`,
      scope
    )

    expect(result.ok).toBe(true)
  })

  it("catches a Toggle left empty", () => {
    const result = validateGeneratedPreviewSource(
      `function Preview() {
        return (
          <PreviewFrame>
            <FieldGroup>
              <FieldLabel htmlFor="email">
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldTitle>Email Notifications</FieldTitle>
                  </FieldContent>
                  <Toggle id="email" />
                </Field>
              </FieldLabel>
            </FieldGroup>
          </PreviewFrame>
        )
      }`,
      scope
    )

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.emptyComponents).toEqual(["Toggle"])
  })

  it("catches a Button with nothing in it", () => {
    const result = validateGeneratedPreviewSource(
      `function Preview() {
        return (
          <PreviewFrame>
            <Button variant="outline"></Button>
          </PreviewFrame>
        )
      }`,
      scope
    )

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.emptyComponents).toEqual(["Button"])
  })

  it("accepts a Toggle that has something to show", () => {
    const result = validateGeneratedPreviewSource(
      `function Preview() {
        return (
          <PreviewFrame>
            <Toggle aria-label="Bold">B</Toggle>
          </PreviewFrame>
        )
      }`,
      scope
    )

    expect(result.ok).toBe(true)
  })

  it("catches a Toggle standing in for a Switch in a vertical field", () => {
    const result = validateGeneratedPreviewSource(
      `function Preview() {
        return (
          <PreviewFrame>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Toggle id="email">On</Toggle>
              </Field>
            </FieldGroup>
          </PreviewFrame>
        )
      }`,
      scope
    )

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.stretchedControls).toEqual(["Toggle"])
  })

  it("catches a nav label that never reaches a button", () => {
    const result = validateGeneratedPreviewSource(
      `function Preview() {
        return (
          <PreviewFrame>
            <SidebarProvider>
              <Sidebar>
                <SidebarMenu>
                  <SidebarMenuItem>Home</SidebarMenuItem>
                  <SidebarMenuItem>Settings</SidebarMenuItem>
                </SidebarMenu>
              </Sidebar>
            </SidebarProvider>
          </PreviewFrame>
        )
      }`,
      scope
    )

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.missingChildren).toEqual([
      { parent: "SidebarMenuItem", required: "SidebarMenuButton" },
    ])
  })

  it("accepts a label inside its button", () => {
    const result = validateGeneratedPreviewSource(
      `function Preview() {
        return (
          <PreviewFrame>
            <SidebarProvider>
              <Sidebar>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton>Home</SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </Sidebar>
            </SidebarProvider>
          </PreviewFrame>
        )
      }`,
      scope
    )

    expect(result.ok).toBe(true)
  })

  it("leaves an item that renders its own component alone", () => {
    const result = validateGeneratedPreviewSource(
      `function NavLink() {
        return <SidebarMenuButton>Home</SidebarMenuButton>
      }
      function Preview() {
        return (
          <PreviewFrame>
            <SidebarProvider>
              <Sidebar>
                <SidebarMenu>
                  <SidebarMenuItem><NavLink /></SidebarMenuItem>
                </SidebarMenu>
              </Sidebar>
            </SidebarProvider>
          </PreviewFrame>
        )
      }`,
      scope
    )

    expect(result.ok).toBe(true)
  })

  it("catches a sidebar with no provider around it", () => {
    const result = validateGeneratedPreviewSource(
      `function Preview() {
        return (
          <PreviewFrame>
            <Sidebar>
              <SidebarContent>
                <SidebarGroup>
                  <SidebarMenu>
                    <SidebarMenuButton>Home</SidebarMenuButton>
                  </SidebarMenu>
                </SidebarGroup>
              </SidebarContent>
            </Sidebar>
          </PreviewFrame>
        )
      }`,
      scope
    )

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.missingProviders).toEqual([
      { component: "Sidebar", root: "SidebarProvider" },
    ])
  })

  it("accepts the same sidebar once the provider is there", () => {
    const result = validateGeneratedPreviewSource(
      `function Preview() {
        return (
          <PreviewFrame>
            <SidebarProvider>
              <Sidebar>
                <SidebarContent>
                  <SidebarMenu>
                    <SidebarMenuButton>Home</SidebarMenuButton>
                  </SidebarMenu>
                </SidebarContent>
              </Sidebar>
            </SidebarProvider>
          </PreviewFrame>
        )
      }`,
      scope
    )

    expect(result.ok).toBe(true)
  })

  it("accepts a part pulled out into a helper component", () => {
    const result = validateGeneratedPreviewSource(
      `function Nav() {
        return <SidebarMenu><SidebarMenuButton>Home</SidebarMenuButton></SidebarMenu>
      }
      function Preview() {
        return (
          <PreviewFrame>
            <SidebarProvider>
              <Sidebar><SidebarContent><Nav /></SidebarContent></Sidebar>
            </SidebarProvider>
          </PreviewFrame>
        )
      }`,
      scope
    )

    expect(result.ok).toBe(true)
  })

  it("catches a chart part with no container", () => {
    const result = validateGeneratedPreviewSource(
      `function Preview() {
        return (
          <PreviewFrame>
            <ChartTooltip />
          </PreviewFrame>
        )
      }`,
      scope
    )

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.missingProviders?.[0]?.root).toBe("ChartContainer")
  })

  it("catches JSX that does not parse", () => {
    const result = validateGeneratedPreviewSource(
      `function Preview() {
        return (
          <PreviewFrame>
            <Button>Save</Button>
        )
      }`,
      scope
    )

    expect(result.ok).toBe(false)
  })

  it("does not flag components the preview declares itself", () => {
    const result = validateGeneratedPreviewSource(
      `function Row() {
        return <Button>Go</Button>
      }
      function Preview() {
        return (
          <PreviewFrame>
            <Row />
          </PreviewFrame>
        )
      }`,
      scope
    )

    expect(result.ok).toBe(true)
  })
})

describe("describeGeneratedPreviewIssue", () => {
  it("tells the model which names it invented, and the real ones", () => {
    const message = describeGeneratedPreviewIssue({
      error: "This preview uses DrawerBody, which is not available here.",
      unknownComponents: ["DrawerBody"],
      unknownFamilies: [
        { prefix: "Drawer", names: ["Drawer", "DrawerContent", "DrawerTitle"] },
      ],
    })

    expect(message).toContain("DrawerBody")
    expect(message).toContain("not in scope")
    expect(message).toContain("Drawer*: Drawer, DrawerContent, DrawerTitle")
  })

  it("spells out the replacement for a raw control", () => {
    const message = describeGeneratedPreviewIssue({
      error: "This preview uses raw HTML controls.",
      rawControls: [{ element: "textarea", use: "Textarea" }],
    })

    expect(message).toContain("<textarea> → Textarea")
  })

  it("says which component belongs in the slot", () => {
    const message = describeGeneratedPreviewIssue({
      error: "This preview nests a component where it does not belong.",
      invalidCompositions: [
        { parent: "InputGroup", child: "Input", use: "InputGroupInput" },
      ],
    })

    expect(message).toContain("Input inside InputGroup → InputGroupInput")
  })

  it("names the orientation that fixes a stretched control", () => {
    const message = describeGeneratedPreviewIssue({
      error: "This preview puts Switch in a vertical Field.",
      stretchedControls: ["Switch"],
    })

    expect(message).toContain('orientation="horizontal"')
    expect(message).toContain("Switch")
  })

  it("names the root a part is missing", () => {
    const message = describeGeneratedPreviewIssue({
      error: "This preview would throw on render.",
      missingProviders: [{ component: "Sidebar", root: "SidebarProvider" }],
    })

    expect(message).toContain("SidebarProvider")
    expect(message).toContain("throws")
  })

  it("points at the render prop instead of asChild", () => {
    const message = describeGeneratedPreviewIssue({
      error: "This preview passes asChild to SheetTrigger.",
      misusedAsChild: ["SheetTrigger"],
    })

    expect(message).toContain("render")
    expect(message).toContain("SheetTrigger")
  })

  it("says to open the overlay", () => {
    const message = describeGeneratedPreviewIssue({
      error: "This preview shows a Drawer that starts closed.",
      closedOverlay: "Drawer",
    })

    expect(message).toContain("defaultOpen")
    expect(message).toContain("Drawer")
  })

  it("lists the allowed values for an invalid variant", () => {
    const message = describeGeneratedPreviewIssue({
      error: "This preview sets a variant that does not exist.",
      invalidProps: [
        {
          component: "Button",
          prop: "size",
          value: "md",
          allowed: ["default", "sm", "lg"],
        },
      ],
    })

    expect(message).toContain('Button size="md"')
    expect(message).toContain("default, sm, lg")
  })
})

describe("the examples the prompt teaches", () => {
  /**
   * Every `previewCode` example in the system prompt, run through the checks.
   *
   * A prompt that demonstrates something the validator rejects would send the
   * model round the repair loop for doing exactly what it was told, so the two
   * have to agree. This catches it the moment either one moves.
   */
  const examples = [
    ...buildAssistantSystemPrompt().matchAll(
      /^function Preview\(\) \{$[\s\S]*?^\}$/gm
    ),
  ].map((match) => match[0])

  it("finds the examples", () => {
    expect(examples.length).toBeGreaterThanOrEqual(2)
  })

  it.each(examples.map((code, i) => [i, code]))(
    "example %i passes every check",
    (_i, code) => {
      const result = validateGeneratedPreviewSource(
        code,
        GENERATED_PREVIEW_COMPONENT_NAMES
      )
      if (!result.ok) throw new Error(result.error)
      expect(result.ok).toBe(true)
    }
  )
})
