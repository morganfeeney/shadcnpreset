import { PropsWithChildren } from "react"
import { DefaultLayout } from "@/components/default-layout"

export default function ToolsLayout({ children }: PropsWithChildren) {
  return <DefaultLayout>{children}</DefaultLayout>
}
