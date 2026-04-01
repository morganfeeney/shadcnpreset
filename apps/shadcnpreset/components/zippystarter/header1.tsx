"use client"

import React, { PropsWithChildren, ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { MenuIcon } from "lucide-react"
import type { VariantProps } from "class-variance-authority"
import { Link } from "@/components/zippystarter/link"
import { Container } from "@/components/zippystarter/container"
import { Separator } from "@/components/ui/separator"
import { Logo } from "@/components/zippystarter/logo"
import { ModeSwitcher } from "@/components/mode-switcher"
import { GitHubLink } from "@/components/github-link"

const HEADER_LINKS = [{ href: "/contact", label: "Contact" }]

const isPathActive = (pathname: string, href: string) => {
  const regex = new RegExp(`^${href}`)
  return regex.test(pathname)
}

type ComponentLink = {
  href: string
  label: string
  button?: VariantProps<typeof buttonVariants>["variant"]
}

interface NavItemProps extends PropsWithChildren {
  href: string
  isActive?: boolean
}

function LogoLink({ size = "lg" }: { size?: "sm" | "lg" }) {
  return (
    <Link href="/">
      <Logo className="size-7" />
    </Link>
  )
}

function NavItemDesktop({ isActive, href, children }: NavItemProps) {
  return (
    <Link
      className={cn(
        "text-header-foreground/60 font-display hover:text-header-foreground relative inline-grid h-8 items-center text-sm transition",
        {
          "text-header-foreground": isActive,
        }
      )}
      href={href}
      key={href}
    >
      {children}
    </Link>
  )
}

function NavItemMobile({ isActive, href, children }: NavItemProps) {
  return (
    <Link
      className={cn(
        "text-header-foreground/60 font-display hover:text-header-foreground inline-grid h-10 items-center px-4 py-2 text-sm transition",
        {
          "text-foreground": isActive,
        }
      )}
      href={href}
      key={href}
    >
      {children}
    </Link>
  )
}

interface DesktopNavProps {
  links: ComponentLink[]
  pathname: string
  className?: string
}

function DesktopNav({ links, pathname, className }: DesktopNavProps) {
  return (
    <div className={cn("flex items-center gap-8", className)}>
      <nav className="flex items-center gap-8">
        {links.map(({ href, label }) => (
          <NavItemDesktop
            key={href}
            href={href}
            isActive={isPathActive(pathname, href)}
          >
            {label}
          </NavItemDesktop>
        ))}
      </nav>
      <Separator orientation="vertical" className="h-6" />
      <div className="flex items-center gap-6">
        <ModeSwitcher />
        <GitHubLink />
        <Button className="-mt-0.5">Sign in</Button>
      </div>
    </div>
  )
}

interface MobileNavProps {
  logo: ReactNode
  links: ComponentLink[]
  pathname: string
  className?: string
}

function MobileNav({ logo, links, pathname, className }: MobileNavProps) {
  const [isOpen, setOpen] = React.useState(false)

  React.useEffect(() => {
    if (pathname) {
      setOpen(false)
    }
  }, [pathname])

  return (
    <div className={className}>
      <Sheet open={isOpen} onOpenChange={setOpen}>
        <div className="flex gap-2">
          <Button>Sign up</Button>
          <SheetTrigger render={<Button size="icon" variant="outline" />}>
            <MenuIcon />
          </SheetTrigger>
        </div>
        <SheetContent className="pt-2">
          <SheetHeader className="text-start">
            {logo}
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <SheetDescription className="sr-only">
              Choose your destination
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-2">
            <nav className="grid">
              {links.map(({ href, label }) => (
                <NavItemMobile
                  key={href}
                  href={href}
                  isActive={isPathActive(pathname, href)}
                >
                  {label}
                </NavItemMobile>
              ))}
            </nav>
            <Separator orientation="horizontal" />
            <NavItemMobile href="#">Log in</NavItemMobile>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

export interface Header1Props {
  logo?: ReactNode
  links?: ComponentLink[]
  pathname?: string
  className?: string
  wrapperClassName?: string
}

export function Header1({
  logo = <LogoLink />,
  links = HEADER_LINKS,
  pathname = "",
  className,
  wrapperClassName,
}: Header1Props) {
  return (
    <Container
      component="header"
      className={cn("flex items-center justify-between py-4", className)}
      wrapperClassName={cn(wrapperClassName, "bg-header inset-header")}
    >
      {logo}
      <MobileNav
        logo={logo}
        links={links}
        pathname={pathname}
        className="md:hidden"
      />
      <DesktopNav
        links={links}
        pathname={pathname}
        className="hidden md:flex"
      />
    </Container>
  )
}
