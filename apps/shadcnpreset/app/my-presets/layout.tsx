import { PropsWithChildren } from "react"
import { ListLayout } from "@/components/list-layout"

export default function MyPresetsLayout({ children }: PropsWithChildren) {
  return <ListLayout>{children}</ListLayout>
}
