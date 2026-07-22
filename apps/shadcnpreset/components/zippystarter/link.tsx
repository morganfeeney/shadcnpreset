import React, { forwardRef } from "react"
import NextLink, { type LinkProps } from "next/link"

type Props = LinkProps & React.ComponentPropsWithoutRef<"a">

export const Link = forwardRef<HTMLAnchorElement, Props>(
  ({ href, ...rest }, ref) => {
    return <NextLink ref={ref} href={href} {...rest} />
  }
)

Link.displayName = "Link"
