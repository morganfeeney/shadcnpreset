import { PropsWithChildren } from "react"
import { Header1 } from "@/components/zippystarter/header1"
import { Container } from "@/components/zippystarter/container"

export function ListLayout({ children }: PropsWithChildren) {
  return (
    <>
      <Header1 />
      <Container data-slot="layout" wrapperClassName="group/layout">
        {children}
      </Container>
    </>
  )
}
