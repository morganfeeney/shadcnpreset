import {
  GithubIcon,
  XIcon,
} from "@/components/zippystarter/icons/social"
import { Mail, Phone } from "lucide-react"
import { siteConfig } from "@/lib/config"

export const ICON_LINKS = [
  {
    href: siteConfig.links.twitter,
    label: "Follow on X",
    Icon: XIcon,
    className: "fill-muted-foreground",
  },
  {
    href: siteConfig.links.github,
    label: "Follow on GitHub",
    Icon: GithubIcon,
    className: "fill-muted-foreground",
  },
]

export const CONTACT_LINKS = [
  {
    href: "tel:+447989476903",
    label: "+447989476903",
    Icon: Phone,
    className: "stroke-muted-foreground",
  },
  {
    href: "mailto:info@yourdomain.com",
    label: "info@yourdomain.com",
    Icon: Mail,
    className: "stroke-muted-foreground",
  },
]
