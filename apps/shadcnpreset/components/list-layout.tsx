import { PropsWithChildren } from "react"
import { Header1 } from "@/components/zippystarter/header1"
import { Footer1 } from "@/components/zippystarter/footer1"
import { Container } from "@/components/zippystarter/container"

export function ListLayout({ children }: PropsWithChildren) {
  return (
    <>
      <Container>
        <Header1 />
        {children}
        <Footer1 />
      </Container>
    </>
  )
}
