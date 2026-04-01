import { cn } from "@/lib/utils"
import { Link } from "@/components/zippystarter/link"
import { Container } from "@/components/zippystarter/container"
import { IconGroup } from "@/components/zippystarter/icon-group"
import { Logo } from "@/components/zippystarter/logo"
import { ICON_LINKS } from "@/data/icon-lists"
import React from "react"
import { siteConfig } from "@/lib/config"

const COLUMNS = [
  {
    header: "Resources",
    links: [
      {
        label: "shadcn theme generator",
        href: "https://zippystarter.com/tools/shadcn-ui-theme-generator",
      },
      { label: "shadcn themes", href: "https://zippystarter.com/themes" },
      { label: "OG image debugger", href: "https://ogimage.info" },
    ],
  },
]

function LogoLink() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 text-sm font-medium tracking-tighter"
    >
      <Logo className="size-5" />
      shadcnpreset
    </Link>
  )
}

export interface FooterColumn {
  header: string
  links: { label: string; href: string }[]
}

function FooterColumn({ header, links }: FooterColumn) {
  return (
    <div className="grid gap-5 text-sm">
      <p className="inline-grid font-display text-foreground">{header}</p>
      <ul className="grid gap-4">
        {links.map(({ href, label }) => (
          <li key={label}>
            <Link
              href={href}
              className="text-footer-foreground/60 hover:text-footer-foreground transition hover:underline"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export interface Footer1Props {
  className?: string
}

export function Footer1({ className }: Footer1Props) {
  return (
    <Container
      component="footer"
      className="mx-auto max-w-7xl gap-4 gap-y-8 pt-10 pb-8 text-sm md:pt-20"
      wrapperClassName={cn("bg-footer", className)}
    >
      <div className="grid grid-cols-12 gap-4 gap-y-16">
        <div className="text-footer-foreground col-span-12 grid content-start justify-items-start gap-8 md:col-span-3">
          <LogoLink />
          <p>{siteConfig.description}</p>
          <IconGroup
            links={ICON_LINKS}
            className="[&_svg]:fill-footer-foreground"
          />
        </div>
        <div className="@container col-span-12 md:col-span-8 md:col-start-5">
          <div className="grid grid-cols-2 items-start gap-4 gap-y-12 @xl:grid-cols-4">
            {COLUMNS.map((column) => (
              <FooterColumn key={column.header} {...column} />
            ))}
          </div>
        </div>
        <p className="text-footer-foreground/60 col-span-12 pt-6 text-xs">
          &copy; {new Date().getFullYear()} shadcnpreset. All rights reserved.
        </p>
      </div>
    </Container>
  )
}
