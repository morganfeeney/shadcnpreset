import { PropsWithChildren } from "react"
import { WideLayoutNoFooter } from "@/components/wide-layout-no-footer"

export default function PresetLayout({ children }: PropsWithChildren) {
  return <WideLayoutNoFooter>{children}</WideLayoutNoFooter>
}
