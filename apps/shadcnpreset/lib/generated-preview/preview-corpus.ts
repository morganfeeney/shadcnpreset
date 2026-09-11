import type { PreviewLayout } from "@/lib/generated-preview/infer-layout"
import type { GeneratedPreviewIssue } from "@/lib/generated-preview/validate"

/** The check a case is expected to trip, named so a failure says which one. */
type IssueKey = Exclude<keyof GeneratedPreviewIssue, "error">

export type PreviewCase = {
  /** What went wrong, or what shape this is. */
  name: string
  /** The prompt that produced it, where it came from a real turn. */
  prompt?: string
  code: string
  /** Omitted when the case is expected to pass every check. */
  issue?: IssueKey
  /** Asserted when the case is also about where the canvas puts it. */
  layout?: PreviewLayout
}

/**
 * Generated previews that went wrong, and the corrected shapes beside them.
 *
 * Every entry came off a real turn. Each rule in `validate.ts` was written
 * after watching one of these render, one screenshot at a time, and that is a
 * bad way to know whether the set is converging: a rule added for one failure
 * can quietly start firing on markup that was fine, or teach the model to
 * route around it — a rule about `Switch` in a vertical `Field` once produced
 * an empty `Toggle` instead, which no rule covered.
 *
 * So the failures live here next to their fixes, and both directions are
 * asserted: the broken shape must still be caught, and the corrected shape
 * must still pass. Add to this whenever a preview comes out wrong, before
 * writing the rule.
 */
export const PREVIEW_CASES: PreviewCase[] = [
  // — Vocabulary: names that do not resolve ————————————————————————
  {
    name: "invents a component name",
    prompt: "show a dashboard sidebar with grouped navigation",
    code: `function Preview() {
      return (
        <PreviewFrame>
          <SidebarProvider>
            <Sidebar>
              <SidebarMenuGroup>
                <SidebarMenuItem><SidebarMenuButton>Home</SidebarMenuButton></SidebarMenuItem>
              </SidebarMenuGroup>
            </Sidebar>
          </SidebarProvider>
        </PreviewFrame>
      )
    }`,
    issue: "unknownComponents",
  },
  {
    name: "sets a variant value that does not exist",
    code: `function Preview() {
      return (
        <PreviewFrame>
          <Button size="md">Save</Button>
        </PreviewFrame>
      )
    }`,
    issue: "invalidProps",
  },
  {
    name: "uses a raw control the preset cannot style",
    code: `function Preview() {
      return (
        <PreviewFrame>
          <Card><CardContent><input placeholder="Email" /></CardContent></Card>
        </PreviewFrame>
      )
    }`,
    issue: "rawControls",
  },

  // — Idiom: Radix habits in a base-ui component set ————————————————
  {
    name: "composes with asChild instead of render",
    prompt: "show a sheet with a notification settings panel",
    code: `function Preview() {
      return (
        <PreviewFrame>
          <Sheet defaultOpen>
            <SheetTrigger asChild><Button>Open</Button></SheetTrigger>
            <SheetContent>Settings</SheetContent>
          </Sheet>
        </PreviewFrame>
      )
    }`,
    issue: "misusedAsChild",
  },
  {
    name: "composes with the render prop",
    code: `function Preview() {
      return (
        <PreviewFrame>
          <Sheet defaultOpen>
            <SheetTrigger render={<Button variant="outline" />}>Open</SheetTrigger>
            <SheetContent>Settings</SheetContent>
          </Sheet>
        </PreviewFrame>
      )
    }`,
  },

  // — Structure: parts without the whole ————————————————————————————
  {
    name: "renders a sidebar with no provider",
    prompt: "show a dashboard sidebar with grouped navigation",
    code: `function Preview() {
      return (
        <PreviewFrame>
          <Sidebar>
            <SidebarContent>
              <SidebarMenu>
                <SidebarMenuItem><SidebarMenuButton>Home</SidebarMenuButton></SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>
        </PreviewFrame>
      )
    }`,
    issue: "missingProviders",
  },
  {
    name: "leaves a nav label outside its button",
    prompt: "show a dashboard sidebar with grouped navigation",
    code: `function Preview() {
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
    issue: "missingChildren",
  },
  {
    name: "puts a plain Input inside an InputGroup",
    prompt: "show a payment form with card fields grouped in an input group",
    code: `function Preview() {
      return (
        <PreviewFrame>
          <InputGroup>
            <InputGroupAddon><InputGroupText>$</InputGroupText></InputGroupAddon>
            <Input placeholder="0.00" />
          </InputGroup>
        </PreviewFrame>
      )
    }`,
    issue: "invalidCompositions",
  },
  {
    name: "uses the group's own control",
    code: `function Preview() {
      return (
        <PreviewFrame>
          <InputGroup>
            <InputGroupAddon><InputGroupText>$</InputGroupText></InputGroupAddon>
            <InputGroupInput placeholder="0.00" />
          </InputGroup>
        </PreviewFrame>
      )
    }`,
  },

  // — Shape: renders, and renders wrong ——————————————————————————————
  {
    name: "shows an overlay that starts closed",
    prompt: "show a drawer with a filter panel inside it",
    code: `function Preview() {
      return (
        <PreviewFrame>
          <Drawer>
            <DrawerTrigger render={<Button>Filters</Button>} />
            <DrawerContent><DrawerTitle>Filters</DrawerTitle></DrawerContent>
          </Drawer>
        </PreviewFrame>
      )
    }`,
    issue: "closedOverlay",
  },
  {
    name: "stretches a switch down a vertical field",
    prompt: "show a sheet with a notification settings panel",
    code: `function Preview() {
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
    issue: "stretchedControls",
  },
  {
    name: "buries the switch in the text column",
    prompt: "show a sheet with a notification settings panel",
    code: `function Preview() {
      return (
        <PreviewFrame>
          <FieldGroup>
            <Field orientation="horizontal">
              <FieldLabel htmlFor="email">Email Notifications</FieldLabel>
              <FieldContent><Switch id="email" /></FieldContent>
            </Field>
          </FieldGroup>
        </PreviewFrame>
      )
    }`,
    issue: "stretchedControls",
  },
  {
    name: "reaches for a Toggle and leaves it empty",
    prompt: "show a sheet with a notification settings panel",
    code: `function Preview() {
      return (
        <PreviewFrame>
          <FieldGroup>
            <FieldLabel htmlFor="email">
              <Field orientation="horizontal">
                <FieldContent><FieldTitle>Email Notifications</FieldTitle></FieldContent>
                <Toggle id="email" />
              </Field>
            </FieldLabel>
          </FieldGroup>
        </PreviewFrame>
      )
    }`,
    issue: "emptyComponents",
  },
  {
    name: "puts the switch beside its label",
    code: `function Preview() {
      return (
        <PreviewFrame>
          <FieldGroup>
            <FieldLabel htmlFor="email">
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldTitle>Email Notifications</FieldTitle>
                  <FieldDescription>Receive notifications via email.</FieldDescription>
                </FieldContent>
                <Switch id="email" defaultChecked />
              </Field>
            </FieldLabel>
          </FieldGroup>
        </PreviewFrame>
      )
    }`,
  },
  {
    name: "stacks fields with nothing to space them",
    prompt: "show a sheet with a notification settings panel",
    code: `function Preview() {
      return (
        <PreviewFrame>
          <div className="p-4">
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
    issue: "ungroupedFields",
  },

  // — Canvas: valid markup the layout has to place —————————————————
  {
    name: "a list of records",
    prompt: "show a list of team members with avatars, roles and a remove button",
    code: `function Preview() {
      return (
        <PreviewFrame>
          <ItemGroup>
            {members.map((member) => (
              <Item key={member.name} variant="outline">
                <ItemMedia><Avatar><AvatarFallback>AL</AvatarFallback></Avatar></ItemMedia>
                <ItemContent><ItemTitle>{member.name}</ItemTitle></ItemContent>
                <ItemActions><Button variant="outline" size="sm">Remove</Button></ItemActions>
              </Item>
            ))}
          </ItemGroup>
        </PreviewFrame>
      )
    }`,
    layout: "list",
  },
  {
    name: "a grid of loading cards",
    prompt: "show a loading state with skeletons for a card grid",
    code: `function Preview() {
      return (
        <PreviewFrame>
          <div className="grid grid-cols-2 gap-4">
            <Card><CardContent><Skeleton className="h-20" /></CardContent></Card>
            <Card><CardContent><Skeleton className="h-20" /></CardContent></Card>
            <Card><CardContent><Skeleton className="h-20" /></CardContent></Card>
          </div>
        </PreviewFrame>
      )
    }`,
    layout: "wide",
  },
  {
    name: "a table of records",
    prompt: "show a table of recent invoices",
    code: `function Preview() {
      return (
        <PreviewFrame>
          <Table>
            <TableHeader><TableRow><TableHead>Invoice</TableHead></TableRow></TableHeader>
            <TableBody><TableRow><TableCell>001</TableCell></TableRow></TableBody>
          </Table>
        </PreviewFrame>
      )
    }`,
    layout: "wide",
  },
  {
    name: "a form",
    prompt: "show a profile settings form",
    code: `function Preview() {
      return (
        <PreviewFrame>
          <Card>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="name">Name</FieldLabel>
                  <Input id="name" />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>
        </PreviewFrame>
      )
    }`,
    layout: "form",
  },
  {
    name: "a whole screen",
    prompt: "show a dashboard sidebar with grouped navigation",
    code: `function Preview() {
      return (
        <PreviewFrame>
          <SidebarProvider>
            <Sidebar>
              <SidebarContent>
                <SidebarMenu>
                  <SidebarMenuItem><SidebarMenuButton>Home</SidebarMenuButton></SidebarMenuItem>
                </SidebarMenu>
              </SidebarContent>
            </Sidebar>
            <SidebarInset><div className="p-4">Overview</div></SidebarInset>
          </SidebarProvider>
        </PreviewFrame>
      )
    }`,
    layout: "page",
  },
  {
    name: "one self-sizing component",
    prompt: "show a date picker",
    code: `function Preview() {
      return (
        <PreviewFrame>
          <DatePicker />
        </PreviewFrame>
      )
    }`,
    layout: "single",
  },
]
