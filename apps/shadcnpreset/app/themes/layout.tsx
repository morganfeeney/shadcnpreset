import { PropsWithChildren } from "react"

import { WideLayout } from "@/components/wide-layout"

export default function Layout({ children }: PropsWithChildren) {
  return <WideLayout>{children}</WideLayout>
}
