"use client"

import { useRef, useState } from "react"

import { cn } from "@/lib/utils"
import { useClickOutside } from "@/components/shadcncraft-examples/hooks/use-click-outside"
import { useIsMobile } from "@/components/shadcncraft-examples/hooks/use-mobile"
import { Button } from "@/components/cn-ui/button"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/cn-ui/navigation-menu"
import {
  MobileNavigationMenu,
  MobileNavigationMenuContent,
  MobileNavigationMenuItem,
  MobileNavigationMenuLink,
  MobileNavigationMenuList,
  MobileNavigationMenuTrigger,
  mobileNavigationMenuTriggerStyle,
} from "@/components/shadcncraft-examples/ui/mobile-navigation-menu"
import { PlaceholderLogo } from "@/components/shadcncraft-examples/ui/placeholder-logo"
import { IconPlaceholder } from "@/components/icon-placeholder"

// Defaults to Tailwind's md: breakpoint.
// Change to 1024 + use lg: classes for 1024px breakpoint or whatever breakpoint you want to use
const MOBILE_BREAKPOINT = 768

export function TopNavigation4() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const toggleMenu = () => setIsMenuOpen((prev) => !prev)

  const navigationContainerRef = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile(MOBILE_BREAKPOINT)

  useClickOutside(navigationContainerRef, () => {
    if (isMobile && isMenuOpen) {
      setIsMenuOpen(false)
    }
  })

  return (
    // To make this a sticky navigation, you can add `sticky top-0 z-50` classes to the parent div
    <div
      className="w-full bg-background/90 py-4 backdrop-blur transition-all ease-in-out"
      role="navigation"
      aria-label="Website top navigation"
      ref={navigationContainerRef}
    >
      <div className="relative mx-auto flex max-w-7xl flex-col md:flex-row md:items-center md:justify-center lg:gap-6">
        {/* Logo and Toggle Mobile Nav Button */}
        <div className="flex items-center justify-between">
          {/* Replace with actual logo */}
          <a href="#" aria-label="Go to home page">
            <PlaceholderLogo />
          </a>

          {/* Toggle Mobile Nav Button - Visible on screen sizes < 768px */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleMenu}
            aria-label={
              isMenuOpen ? "Close navigation menu" : "Open navigation menu"
            }
          >
            {isMenuOpen ? (
              <IconPlaceholder
                lucide="X"
                tabler="IconX"
                hugeicons="Cancel01Icon"
                phosphor="XIcon"
                remixicon="RiCloseLine"
                className="animate-in zoom-in-50"
              />
            ) : (
              <IconPlaceholder
                lucide="Menu"
                tabler="IconMenu2"
                hugeicons="Menu01Icon"
                phosphor="ListIcon"
                remixicon="RiMenuLine"
                className="animate-in zoom-in-50"
              />
            )}
          </Button>
        </div>

        {/* Desktop Navigation - Visible on screen sizes â‰¥ 768px */}
        <div className="hidden md:contents">
          <DesktopNavigation />
          <ActionButtons />
        </div>

        {/* Mobile Navigation - Visible on screen sizes < 768px */}
        <div
          className={cn(
            "grid transition-all duration-300 ease-in-out md:hidden",
            isMenuOpen
              ? "grid-rows-[1fr] pt-5 pb-1 opacity-100"
              : "pointer-events-none grid-rows-[0fr] opacity-0"
          )}
        >
          <div
            className={cn(isMenuOpen ? "overflow-visible" : "overflow-hidden")}
            inert={!isMenuOpen || undefined}
            aria-hidden={!isMenuOpen}
          >
            <div className="flex flex-col gap-7">
              <MobileNavigation />
              <ActionButtons />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ActionButtons() {
  return (
    <div className="flex flex-col gap-1.5 md:flex-row">
      <Button variant="ghost" className="w-full md:w-fit">
        Login
      </Button>
      <Button className="w-full md:w-fit">Get started</Button>
    </div>
  )
}

function DesktopNavigation() {
  return (
    <NavigationMenu className="rounded-xl border p-1 shadow-sm">
      <NavigationMenuList>
        {NAV_ITEMS.map((item) => {
          // Replace with actual active link detection
          const isActive = item.href === "/pathname"
          return (
            <NavigationMenuItem key={item.label}>
              {item.children && item.children.length > 0 ? (
                <>
                  <NavigationMenuTrigger className="bg-transparent">
                    {item.label}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid w-75 max-w-3xl gap-1 lg:w-100">
                      {item.children.map((child) => {
                        // Replace with actual active link detection
                        const childIsActive = child.href === "/pathname"
                        return (
                          <NavigationMenuLink
                            key={child.label}
                            active={childIsActive}
                            render={
                              <CustomNavLink
                                label={child.label}
                                description={child.description}
                                href={child.href}
                                icon={child.icon}
                                className="flex flex-row items-start gap-1.5"
                              />
                            }
                          ></NavigationMenuLink>
                        )
                      })}
                    </div>
                  </NavigationMenuContent>
                </>
              ) : (
                <NavigationMenuLink
                  className={cn(navigationMenuTriggerStyle(), "bg-transparent")}
                  active={isActive}
                  render={
                    <a href={item.href} className="flex items-center gap-1.5" />
                  }
                >
                  {item.icon}
                  {item.label}
                </NavigationMenuLink>
              )}
            </NavigationMenuItem>
          )
        })}
      </NavigationMenuList>
    </NavigationMenu>
  )
}

function MobileNavigation() {
  return (
    <MobileNavigationMenu mode="single">
      <MobileNavigationMenuList>
        {NAV_ITEMS.map((item) => {
          // Replace with actual active link detection
          const isActive = item.href === "/pathname"
          return (
            <MobileNavigationMenuItem key={item.label} value={item.label}>
              {item.children && item.children.length > 0 ? (
                <>
                  <MobileNavigationMenuTrigger>
                    {item.label}
                  </MobileNavigationMenuTrigger>
                  <MobileNavigationMenuContent>
                    {item.children.map((child) => {
                      // Replace with actual active link detection
                      const childIsActive = child.href === "/pathname"
                      return (
                        <MobileNavigationMenuLink
                          key={child.label}
                          active={childIsActive}
                          render={
                            <CustomNavLink
                              label={child.label}
                              description={child.description}
                              href={child.href}
                              icon={child.icon}
                              className="flex flex-row items-start gap-1.5"
                            />
                          }
                        ></MobileNavigationMenuLink>
                      )
                    })}
                  </MobileNavigationMenuContent>
                </>
              ) : (
                <MobileNavigationMenuLink
                  className={cn(mobileNavigationMenuTriggerStyle())}
                  active={isActive}
                  render={
                    <a href={item.href} className="flex items-center gap-1.5" />
                  }
                >
                  {item.icon}
                  {item.label}
                </MobileNavigationMenuLink>
              )}
            </MobileNavigationMenuItem>
          )
        })}
      </MobileNavigationMenuList>
    </MobileNavigationMenu>
  )
}

function CustomNavLink({
  className,
  label,
  description,
  icon,
  href,
  ...props
}: React.ComponentProps<"a"> & {
  label: string
  description?: string
  icon?: React.ReactNode
}) {
  return (
    // You can replace <a> with Next.js Link component or whatever alternative your framework provides
    <a href={href} className={cn("relative", className)} {...props}>
      <div
        className="mt-0.5 [&>svg:not([class*='text-'])]:text-foreground"
        aria-hidden="true"
      >
        {icon}
      </div>
      <div className="flex flex-col gap-1">
        <span className="truncate text-sm font-medium">{label}</span>
        {description && (
          <span className="text-sm text-muted-foreground">{description}</span>
        )}
      </div>
    </a>
  )
}

type NavigationItem =
  | {
      label: string
      description?: string
      href: string
      icon?: React.ReactNode
      children: NavigationItem[]
    }
  | {
      label: string
      description?: string
      href: string
      icon?: React.ReactNode
      children?: never
    }

const NAV_ITEMS: NavigationItem[] = [
  {
    label: "Products",
    href: "",
    children: [
      {
        label: "AI",
        description: "Generate insights and recommendations",
        href: "#",
        icon: (
          <IconPlaceholder
            lucide="Sparkles"
            tabler="IconSparkles"
            hugeicons="SparklesIcon"
            phosphor="SparkleIcon"
            remixicon="RiSparklingLine"
          />
        ),
      },
      {
        label: "Performance",
        description: "Lightning-fast load times",
        href: "#",
        icon: (
          <IconPlaceholder
            lucide="Activity"
            tabler="IconActivity"
            hugeicons="Activity01Icon"
            phosphor="ActivityIcon"
            remixicon="RiPulseLine"
          />
        ),
      },
      {
        label: "Security",
        description: "Keep your data safe and secure",
        href: "#",
        icon: (
          <IconPlaceholder
            lucide="Lock"
            tabler="IconLock"
            hugeicons="SquareLock01Icon"
            phosphor="LockIcon"
            remixicon="RiLockLine"
          />
        ),
      },
      {
        label: "Customer Support",
        description: "Get help when you need it",
        href: "#",
        icon: (
          <IconPlaceholder
            lucide="Headset"
            tabler="IconHeadset"
            hugeicons="HeadsetIcon"
            phosphor="HeadsetIcon"
            remixicon="RiHeadphoneLine"
          />
        ),
      },
    ],
  },
  {
    label: "Solutions",
    href: "",
    children: [
      {
        label: "Marketplace",
        description: "Find and buy AI tools",
        href: "#",
        icon: (
          <IconPlaceholder
            lucide="ShoppingBag"
            tabler="IconShoppingBag"
            hugeicons="ShoppingBag01Icon"
            phosphor="ShoppingBagIcon"
            remixicon="RiShoppingBag3Line"
          />
        ),
      },
      {
        label: "Guides",
        description: "Learn how to use AI tools",
        href: "#",
        icon: (
          <IconPlaceholder
            lucide="Compass"
            tabler="IconCompass"
            hugeicons="Compass01Icon"
            phosphor="CompassIcon"
            remixicon="RiCompassLine"
          />
        ),
      },
      {
        label: "API Integration",
        description: "Integrate AI tools into your app",
        href: "#",
        icon: (
          <IconPlaceholder
            lucide="CircuitBoard"
            tabler="IconCpu"
            hugeicons="CpuIcon"
            phosphor="CircuitryIcon"
            remixicon="RiCpuLine"
          />
        ),
      },
      {
        label: "Partnerships",
        description: "Partner with us to grow your business",
        href: "#",
        icon: (
          <IconPlaceholder
            lucide="Handshake"
            tabler="IconHeartHandshake"
            hugeicons="AgreementIcon"
            phosphor="HandshakeIcon"
            remixicon="RiHandHeartLine"
          />
        ),
      },
    ],
  },
  {
    label: "Pricing",
    href: "#",
  },
  {
    label: "Company",
    href: "#",
  },
]
