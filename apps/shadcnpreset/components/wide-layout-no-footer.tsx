import { PropsWithChildren } from "react"
import { ContainerOuter } from "@/components/zippystarter/container"
import { Header1 } from "@/components/zippystarter/header1"

export function WideLayoutNoFooter({ children }: PropsWithChildren) {
  return (
    <>
      <ContainerOuter className="grid min-h-screen grid-rows-[auto_1fr_auto]">
        <Header1 className="max-w-full!" />
        {children}
      </ContainerOuter>
    </>
  )
}
