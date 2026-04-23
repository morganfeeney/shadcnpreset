import { ToolsList } from "@/components/tools-list"
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/page-header"

const TOOLS = [
  {
    href: "/tools/preset-theme",
    title: "Preset Theme CSS Extractor",
    description:
      "Paste a preset code to decode its config, preview it, and copy ready-to-use CSS custom properties.",
  },
] as const

export default function ToolsPage() {
  return (
    <>
      <PageHeader>
        <PageHeaderHeading className="max-w-4xl">Tools</PageHeaderHeading>
        <PageHeaderDescription className="text-muted-foreground">
          Utility pages for decoding, inspecting, and working with presets.
        </PageHeaderDescription>
      </PageHeader>{" "}
      <main className="grid gap-4">
        <ToolsList tools={TOOLS} />
      </main>
    </>
  )
}
