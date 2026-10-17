"use client"

import { useEffect, type ReactNode } from "react"
import Link from "next/link"
import {
  ArrowUpRightIcon,
  CheckCircleIcon,
  CheckIcon,
  CopyIcon,
  FigmaLogoIcon,
  PaintBrushIcon,
  PlugIcon,
} from "@phosphor-icons/react"

import { ShadcncraftLogo } from "@/components/shadcncraft-pitch/shadcncraft-logo"
import { Button, buttonVariants } from "@/components/ui/button"
import { Logo } from "@/components/zippystarter/logo"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import { shadcncraftHref } from "@/lib/affiliate-link"
import { trackEvent } from "@/lib/analytics-events"
import { cn } from "@/lib/utils"

const PARTNER = "shadcncraft"
const ASSETS = "https://assets.shadcncraft.com/images/site"

// Copy and figures from shadcncraft.com, October 2026. Check them against the
// site when they change their tiers.
export const SHADCNCRAFT_PITCH_HEADING =
  "Apply your preset to a premium shadcn/ui design system"
export const SHADCNCRAFT_SOCIAL_PROOF = "Trusted by 16,000+ creators and teams"
export const SHADCNCRAFT_STARTING_PRICE = "$119"
export const SHADCNCRAFT_FEATURES = [
  "Production-ready shadcn/ui blocks and components",
  "The official shadcn/ui Figma kit, in all 8 styles",
  "A Figma plugin for styles, themes and presets",
  "Figma layouts exported to React code",
  "Agent skills and an MCP server for your IDE",
  "Lifetime updates and unlimited commercial use",
]
const AVATARS = [1, 2, 3, 4, 5].map(
  (n) => `https://assets.shadcncraft.com/registry/avatars/person-${n}.webp`
)

/**
 * The case for shadcncraft Pro, laid out as a landing page: what it is, how a
 * preset gets there, what the blocks look like, and what it costs. Shared by the `/shadcncraft` page
 * and the dialog on preset pages; `placement` tells their impressions and
 * clicks apart.
 */
export function ShadcncraftPitch({
  presetCode,
  placement,
  headingLevel: Heading = "h2",
}: {
  /** The preset being looked at, if any; the steps then offer its code. */
  presetCode?: string
  placement: string
  /** `h1` on its own page; a dialog titles itself. */
  headingLevel?: "h1" | "h2"
}) {
  useShadcncraftImpression(placement)

  const buy = (label: string, className?: string) => (
    <BuyLink
      presetCode={presetCode}
      placement={placement}
      className={className}
    >
      {label}
    </BuyLink>
  )

  return (
    <div className="grid gap-16 sm:gap-20">
      <section className="grid gap-10">
        <div className="grid justify-items-center gap-6 text-center">
          <p className="mb-4 flex items-center gap-2 text-sm font-medium">
            <Logo className="size-4" />
            shadcnpreset
            <span className="text-muted-foreground">×</span>
            <ShadcncraftLogo className="size-4" />
            shadcncraft
          </p>
          <div className="grid justify-items-center gap-4">
            <Heading className="text-4xl leading-14 font-medium tracking-tight text-balance sm:text-5xl">
              {SHADCNCRAFT_PITCH_HEADING}
            </Heading>
            <p className="max-w-[50ch] text-pretty text-muted-foreground">
              Build complete pages in minutes with premium shadcn/ui blocks, all
              styled to match your preset.
            </p>
          </div>
          <div className="grid justify-items-center gap-4">
            {buy("Buy now")}
            <div className="grid items-center justify-center gap-3">
              <div className="m-auto flex -space-x-2">
                {AVATARS.map((src) => (
                  <img
                    key={src}
                    src={src}
                    alt=""
                    className="size-7 rounded-full border-2 border-background object-cover"
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                {SHADCNCRAFT_SOCIAL_PROOF}
              </p>
            </div>
          </div>
        </div>
        <ThemedImage
          name="why-home"
          alt="A wall of shadcncraft Pro blocks: testimonials, dashboards, pricing, chat and product pages"
        />
      </section>

      <Section
        title="How it works"
        body="From this page to the Figma kit in three steps."
      >
        <ol className="grid divide-y rounded-xl border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <Step icon={<FigmaLogoIcon />} step="Step 1" title="Get the kit" />
          <Step icon={<PlugIcon />} step="Step 2" title="Open the plugin" />
          <Step
            icon={<PaintBrushIcon />}
            step="Step 3"
            title="Apply your preset"
          >
            {presetCode ? <PresetCode code={presetCode} /> : null}
          </Step>
        </ol>
      </Section>

      <Section
        title="Figma and React, one to one"
        body="Every block in the Figma kit has its React code, so what you design in this preset is what you ship."
        actions={
          <>
            {buy("Buy now")}
            {presetCode ? (
              <Link
                href={`/build?preset=${presetCode}`}
                className={buttonVariants({ variant: "outline", size: "lg" })}
              >
                Build a page with them
              </Link>
            ) : null}
          </>
        }
      >
        <ThemedImage
          name="free-home"
          alt="A shadcncraft login block in Figma beside its React code"
        />
      </Section>

      <Section
        title="Built for AI workflows"
        body="Claude Code, Cursor and Codex can build with your blocks, components and tokens."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Card
            title="Export to React"
            body="Select a Figma frame and get clean, shadcn-compatible React code."
            image="built-for-modern-dev-workflows-export-to-react"
          />
          <Card
            title="MCP-ready blocks"
            body="Agent skills and an MCP server bring the kit into your IDE."
            image="built-for-modern-dev-workflows-mcp"
          />
        </div>
      </Section>

      <section className="grid gap-8 rounded-xl border p-6 sm:p-8 md:grid-cols-[3fr_2fr]">
        <div className="grid content-start gap-5">
          <h3 className="text-2xl font-medium">
            What you get with shadcncraft
          </h3>
          <ul className="grid gap-3">
            {SHADCNCRAFT_FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5 text-sm">
                <CheckCircleIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
        <div className="grid content-end gap-4 md:justify-items-end md:text-right">
          <div className="grid gap-1">
            <p className="text-sm text-muted-foreground">
              Lifetime access, starting at
            </p>
            <p className="text-5xl font-medium tracking-tight">
              {SHADCNCRAFT_STARTING_PRICE}
            </p>
          </div>
          {buy("Buy now", "w-full")}
          <p className="text-xs text-muted-foreground">
            One-time payment. We earn a commission on sales.
          </p>
        </div>
      </section>
    </div>
  )
}

/** Counts one shadcncraft impression for a placement, when it is shown. */
export function useShadcncraftImpression(placement: string) {
  useEffect(() => {
    trackEvent("affiliate_impression", { partner: PARTNER, placement })
  }, [placement])
}

/** Tagged, sponsored link to shadcncraft that reports its click. */
export function BuyLink({
  presetCode,
  placement,
  className,
  children,
}: {
  presetCode?: string
  placement: string
  className?: string
  children: ReactNode
}) {
  return (
    <a
      href={shadcncraftHref(placement)}
      target="_blank"
      // Search engines expect paid links marked sponsored.
      rel="sponsored noopener"
      className={cn(buttonVariants({ size: "lg" }), className)}
      onClick={() => {
        trackEvent("affiliate_click", {
          partner: PARTNER,
          placement,
          preset_code: presetCode,
        })
      }}
    >
      {children}
      <ArrowUpRightIcon />
    </a>
  )
}

/** One of shadcncraft's site images, in light and dark. */
function ThemedImage({
  name,
  alt,
  className,
}: {
  name: string
  alt: string
  className?: string
}) {
  const frame = cn(
    "w-full overflow-hidden rounded-xl border bg-muted",
    className
  )
  return (
    <>
      <img
        src={`${ASSETS}/${name}-light.webp`}
        alt={alt}
        loading="lazy"
        className={cn(frame, "dark:hidden")}
      />
      <img
        src={`${ASSETS}/${name}-dark.webp`}
        alt={alt}
        loading="lazy"
        className={cn(frame, "hidden dark:block")}
      />
    </>
  )
}

function Step({
  icon,
  step,
  title,
  children,
}: {
  icon: ReactNode
  step: string
  title: string
  children?: ReactNode
}) {
  return (
    <li className="grid content-start justify-items-center gap-1 p-6 text-center [&_svg]:size-6">
      <span className="mb-2">{icon}</span>
      <p className="text-sm text-muted-foreground">{step}</p>
      <p className="font-medium">{title}</p>
      {children ? <div className="mt-3">{children}</div> : null}
    </li>
  )
}

function PresetCode({ code }: { code: string }) {
  const { isCopied, copyToClipboard } = useCopyToClipboard()
  return (
    <Button
      variant="outline"
      size="sm"
      className="font-mono"
      onClick={() => copyToClipboard(code)}
    >
      {code}
      {isCopied ? <CheckIcon /> : <CopyIcon />}
      <span className="sr-only">
        {isCopied ? "Copied" : "Copy preset code"}
      </span>
    </Button>
  )
}

/** A titled section: heading, a line of copy, optional actions, then content. */
function Section({
  title,
  body,
  actions,
  children,
}: {
  title: string
  body: string
  actions?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="grid gap-8">
      <div className="mx-auto grid max-w-lg justify-items-center gap-3 text-center">
        <h3 className="text-2xl font-medium text-balance">{title}</h3>
        <p className="text-sm text-pretty text-muted-foreground">{body}</p>
        {actions ? (
          <div className="mt-3 flex flex-wrap justify-center gap-3">
            {actions}
          </div>
        ) : null}
      </div>
      {children}
    </section>
  )
}

function Card({
  title,
  body,
  image,
}: {
  title: string
  body: string
  image: string
}) {
  return (
    <div className="grid content-start overflow-hidden rounded-xl border">
      <ThemedImage
        name={image}
        alt=""
        className="rounded-none border-0 border-b"
      />
      <div className="grid gap-1 p-5">
        <h4 className="font-medium">{title}</h4>
        <p className="text-sm text-muted-foreground">{body}</p>
      </div>
    </div>
  )
}
