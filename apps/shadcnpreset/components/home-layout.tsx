import { ReactNode } from "react"
import { Header1 } from "@/components/zippystarter/header1"
import { Container } from "@/components/zippystarter/container"

export function HomeLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header1 />
      <Container data-slot="layout" wrapperClassName="group/layout">
        {children}
      </Container>
    </>
  )
}
