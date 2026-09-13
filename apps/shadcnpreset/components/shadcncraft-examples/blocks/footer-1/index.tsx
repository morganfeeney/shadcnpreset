import { RiLinkedinLine, RiTwitterXLine } from "@remixicon/react"

import { Badge } from "@/components/cn-ui/badge"
import { PlaceholderLogo } from "@/components/shadcncraft-examples/ui/placeholder-logo"
import { Separator } from "@/components/cn-ui/separator"

export function Footer1() {
  return (
    <footer
      className="w-full bg-background py-5 lg:py-16"
      role="contentinfo"
      aria-label="Website footer"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:gap-7">
        {/* Navigation */}
        <nav
          className="grid gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-7"
          aria-label="Footer navigation"
        >
          {navigationData.map((section) => (
            <div key={section.title} className="flex flex-col gap-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                {section.title}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {section.links.map((link) => (
                  <li key={link.label} className="text-base">
                    <a href={link.href} className="flex items-center gap-1">
                      {link.label}
                      {link.badge && (
                        <Badge variant="outline">{link.badge}</Badge>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <Separator role="presentation" aria-hidden="true" />

        {/* Logo and Social Links and Copyright */}
        <div className="flex flex-col gap-7 md:flex-row md:items-center md:justify-between">
          <a href="#" aria-label="Go to home page">
            {/* Replace with your real logo  */}
            <PlaceholderLogo />
          </a>

          {/* Social Links and Copyright */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex items-center gap-2.5 md:gap-3">
              <RiLinkedinLine className="size-4" />
              <RiTwitterXLine className="size-4" />
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; Copyright Acme Inc. 2025. All right reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

interface NavigationLink {
  label: string
  href: string
  badge?: string
}

interface NavigationSection {
  title: string
  links: NavigationLink[]
}

const navigationData: NavigationSection[] = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#" },
      { label: "Pricing", href: "#" },
      { label: "Integrations", href: "#", badge: "New" },
      { label: "Demo", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Press", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Help Center", href: "#" },
      { label: "FAQs", href: "#" },
      { label: "Guides", href: "#" },
      { label: "Community", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Security", href: "#" },
      { label: "Cookie Settings", href: "#" },
    ],
  },
]
