import { PropsWithChildren } from "react"
import { ContainerOuter } from "@/components/zippystarter/container"
import { Header1 } from "@/components/zippystarter/header1"

/**
 * A shell that fills the viewport exactly: header on top, one row beneath it
 * for the page. Nothing here scrolls — the page owns its own scrolling regions,
 * so the header stays put instead of sliding away under a sticky sidebar.
 */
export function WideLayoutNoFooter({ children }: PropsWithChildren) {
  return (
    <ContainerOuter className="grid h-dvh grid-rows-[auto_minmax(0,1fr)] overflow-hidden">
      <Header1 className="max-w-full!" />
      {children}
    </ContainerOuter>
  )
}
