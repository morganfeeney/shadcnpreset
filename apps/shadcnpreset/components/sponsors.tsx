import type { ComponentType, SVGProps } from "react"

import { ShadcncraftLogo } from "@/components/shadcncraft-pitch/shadcncraft-logo"
import { shadcncraftHref } from "@/lib/affiliate-link"

export type Sponsor = {
  /** Analytics `partner`, and the key a dismissal is remembered under. */
  partner: string
  name: string
  /** One short line; the floating card has room for two at most. */
  tagline: string
  /** Shows a verified badge beside the name. */
  verified: boolean
  /** Square mark, drawn in the current text colour. */
  Logo: ComponentType<SVGProps<SVGSVGElement>>
  /** The sponsor's tagged link for a placement, from its affiliate scheme. */
  href: (placement: string) => string
}

/** Sponsors the floating card can show. */
export const SPONSORS: Sponsor[] = [
  {
    partner: "shadcncraft",
    name: "shadcncraft",
    tagline: "Pro blocks your preset drops straight into.",
    verified: true,
    Logo: ShadcncraftLogo,
    href: shadcncraftHref,
  },
]
