import { PropsWithChildren } from "react"
import { ContainerOuter } from "@/components/zippystarter/container"
import { Header1 } from "@/components/zippystarter/header1"
import { Footer1 } from "@/components/zippystarter/footer1"

export function WideLayout({ children }: PropsWithChildren) {
  return (
    <>
      <ContainerOuter className="grid min-h-screen grid-rows-[auto_1fr_auto]">
        <Header1 className="max-w-full!" />
        {children}
        <Footer1 />
      </ContainerOuter>
    </>
  )
}
