import { PropsWithChildren } from "react"

import { Container } from "@/components/zippystarter/container"

export function ListLayout({ children }: PropsWithChildren) {
  return (
    <>
      <Container data-slot="layout" wrapperClassName="group/layout">
        {children}
      </Container>
    </>
  )
}
