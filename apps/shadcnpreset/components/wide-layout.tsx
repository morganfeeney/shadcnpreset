import { PropsWithChildren } from "react"
import {
  ContainerInner,
  ContainerOuter,
  Container,
} from "@/components/zippystarter/container"
import { Header1 } from "@/components/zippystarter/header1"
import { Footer1 } from "@/components/zippystarter/footer1"

export function WideLayout({ children }: PropsWithChildren) {
  return (
    <>
      <ContainerOuter>
        <Header1 className="max-w-full!" />
        <Container>{children}</Container>
        <Footer1 />
      </ContainerOuter>
    </>
  )
}
