/**
 * The sections the page builder can place, and the kinds of page they belong
 * to. Each section has one or more shadcncraft variants, generated into
 * variants.ts by `pnpm generate:page-builder-catalog` from the blocks we have
 * imported. No imports here: the generator reads this file.
 *
 * Blocks take no props — their content is baked in — so building a page is
 * choosing sections and a variant of each, never writing them. Jev decides
 * both; the order below stays in code. The header, sidebar and footer around
 * the blocks are layout slots, chosen apart from them.
 */

export const PAGE_KINDS = ["marketing", "store", "dashboard"] as const
export type PageKind = (typeof PAGE_KINDS)[number]

/** Read by Jev as the criteria of one Choice, so each says what the page is. */
export const PAGE_KIND_DESCRIPTIONS: Record<PageKind, string> = {
  marketing:
    "A public website or landing page that presents a product, service, business or person to visitors",
  store: "An online shop where customers browse, choose and buy products",
  dashboard:
    "A signed-in application screen of charts, metrics and reports for monitoring a business or team",
}

export const PAGE_KIND_LABELS: Record<PageKind, string> = {
  marketing: "Landing page",
  store: "Store",
  dashboard: "Dashboard",
}

export type PageSection = {
  /** The shadcncraft category: every block `<id>-N` is a variant of it. */
  id: string
  label: string
  /**
   * What the section shows, read by Jev as part of "would this page
   * include…". When a section keeps being picked or missed, this is the
   * thing to fix. Frames are on every page, so they need none.
   */
  shows?: string
  kinds: readonly PageKind[]
  /** In every draft Jev lays out; the visitor can still remove it. */
  always?: boolean
}

/**
 * In the order they stack on a page. A section that suits several kinds
 * keeps one position, so FAQs always sit below the products they answer
 * questions about.
 */
export const PAGE_SECTIONS: readonly PageSection[] = [
  // The page's navigation is its header, chosen apart from the blocks, so a
  // hero here renders without the nav shadcncraft ships it with.
  { id: "hero", label: "Hero", kinds: ["marketing"], always: true },

  // Marketing
  {
    id: "social-proof",
    label: "Logo cloud",
    shows: "logos of well-known customers or partners",
    kinds: ["marketing"],
  },
  {
    id: "benefits",
    label: "Benefits",
    shows:
      "features or benefits, each with an icon or image and a short explanation",
    kinds: ["marketing"],
  },
  {
    id: "metrics",
    label: "Stats",
    shows:
      "a few headline numbers that prove results, such as customers served or satisfaction",
    kinds: ["marketing"],
  },
  {
    id: "team",
    label: "Team",
    shows: "the people behind the business, with photos, names and roles",
    kinds: ["marketing"],
  },

  // Store
  {
    id: "product-category",
    label: "Categories",
    shows: "tiles for browsing the shop by product category",
    kinds: ["store"],
  },
  {
    id: "product-list",
    label: "Product grid",
    shows: "a grid of products for sale with photos and prices",
    kinds: ["store"],
  },
  {
    id: "product-details",
    label: "Product details",
    shows:
      "one product's page: photos, price, size and colour options and an add-to-cart button",
    kinds: ["store"],
  },
  {
    id: "shopping-cart",
    label: "Cart",
    shows: "a shopping cart listing chosen items, quantities and a subtotal",
    kinds: ["store"],
  },
  {
    id: "checkout",
    label: "Checkout",
    shows: "a checkout form for shipping address, delivery method and payment",
    kinds: ["store"],
  },

  // Dashboard, in shadcncraft's own dashboard order: headline numbers and
  // trends first, detail tables and AI commentary last.
  {
    id: "metric-cards",
    label: "KPI cards",
    shows:
      "a strip of headline business numbers, such as revenue, leads and conversion, with their change since last period",
    kinds: ["dashboard"],
  },
  {
    id: "hero-time-series",
    label: "Trend chart",
    shows:
      "a large chart of leads or sign-ups over time against the previous period",
    kinds: ["dashboard"],
  },
  {
    id: "revenue-vs-target",
    label: "Revenue vs target",
    shows: "sales revenue this quarter against its target",
    kinds: ["dashboard"],
  },
  {
    id: "goal-progress",
    label: "Goals",
    shows: "progress bars towards a team's marketing goals",
    kinds: ["dashboard"],
  },
  {
    id: "traffic-by-channel",
    label: "Traffic by channel",
    shows:
      "website traffic split by where visitors came from, such as search, social or email",
    kinds: ["dashboard"],
  },
  {
    id: "channel-performance",
    label: "Channel performance",
    shows: "a comparison of marketing channels by spend, leads and return",
    kinds: ["dashboard"],
  },
  {
    id: "campaign-performance",
    label: "Campaigns",
    shows: "a table of marketing campaigns and how each performed",
    kinds: ["dashboard"],
  },
  {
    id: "paid-media-allocation",
    label: "Paid media",
    shows: "how the paid advertising budget is split across ad platforms",
    kinds: ["dashboard"],
  },
  {
    id: "cost-per-acquisition-trend",
    label: "Cost per acquisition",
    shows: "what it costs in advertising to win each new customer, over time",
    kinds: ["dashboard"],
  },
  {
    id: "attribution-breakdown",
    label: "Attribution",
    shows: "which marketing channels get credit for leads and revenue",
    kinds: ["dashboard"],
  },
  {
    id: "marketing-funnel",
    label: "Marketing funnel",
    shows:
      "how many visitors become leads, then qualified leads, then customers",
    kinds: ["dashboard"],
  },
  {
    id: "lead-to-customer-funnel",
    label: "Lead to customer",
    shows: "how sales leads convert stage by stage into paying customers",
    kinds: ["dashboard"],
  },
  {
    id: "leads-by-region",
    label: "Leads by region",
    shows: "where in the world leads come from, on a map or by region",
    kinds: ["dashboard"],
  },
  {
    id: "top-landing-pages",
    label: "Top landing pages",
    shows: "the website pages that attract the most visitors and conversions",
    kinds: ["dashboard"],
  },
  {
    id: "engagement-by-day-hour",
    label: "Engagement heatmap",
    shows: "a heatmap of which days and hours users are most active",
    kinds: ["dashboard"],
  },
  {
    id: "pipeline-by-stage",
    label: "Sales pipeline",
    shows: "the value of open sales deals at each stage of the sales pipeline",
    kinds: ["dashboard"],
  },
  {
    id: "win-rate",
    label: "Win rate",
    shows: "the share of sales deals won and conversion between sales stages",
    kinds: ["dashboard"],
  },
  {
    id: "deal-velocity-by-segment",
    label: "Deal velocity",
    shows: "how quickly sales deals close for each customer segment",
    kinds: ["dashboard"],
  },
  {
    id: "rep-leaderboard",
    label: "Rep leaderboard",
    shows: "a ranking of sales reps by deals closed and revenue",
    kinds: ["dashboard"],
  },
  {
    id: "deals-table",
    label: "Deals table",
    shows:
      "a detailed table of individual sales deals with owner, stage and value",
    kinds: ["dashboard"],
  },
  {
    id: "customer-health-score",
    label: "Customer health",
    shows:
      "the health of existing customer accounts and which are at risk of leaving",
    kinds: ["dashboard"],
  },
  {
    id: "activity-feed",
    label: "Activity feed",
    shows: "a timeline of recent actions by team members and customers",
    kinds: ["dashboard"],
  },
  {
    id: "ai-insights",
    label: "AI insights",
    shows: "alerts and suggestions an AI has written about the data",
    kinds: ["dashboard"],
  },

  // Shared closing sections
  {
    id: "testimonials",
    label: "Testimonials",
    shows: "quotes from happy customers with their names and photos",
    kinds: ["marketing", "store"],
  },
  {
    id: "pricing",
    label: "Pricing",
    shows: "subscription plans side by side with their prices",
    kinds: ["marketing"],
  },
  {
    id: "blog-listing",
    label: "Blog",
    shows: "a list of recent articles or blog posts",
    kinds: ["marketing"],
  },
  {
    id: "careers",
    label: "Careers",
    shows: "open jobs at the company",
    kinds: ["marketing"],
  },
  {
    id: "faqs",
    label: "FAQs",
    shows: "frequently asked questions with their answers",
    kinds: ["marketing", "store"],
  },
  {
    id: "newsletter-signup",
    label: "Newsletter",
    shows: "an email signup for a newsletter or updates",
    kinds: ["marketing", "store"],
  },
  {
    id: "contact",
    label: "Contact",
    shows: "ways to get in touch: a contact form, email, phone or address",
    kinds: ["marketing", "store"],
  },
  {
    id: "cta",
    label: "Call to action",
    shows: "a closing banner asking the visitor to sign up or get started",
    kinds: ["marketing"],
  },
]

/** The parts of a page around its blocks, each chosen on its own. */
export const LAYOUT_SLOTS = ["header", "sidebar", "footer"] as const
export type LayoutSlot = (typeof LAYOUT_SLOTS)[number]

/** A block id per slot, or null for none. */
export type PageLayout = Record<LayoutSlot, string | null>

export const LAYOUT_SLOT_LABELS: Record<LayoutSlot, string> = {
  header: "Header",
  sidebar: "Sidebar",
  footer: "Footer",
}

/**
 * The shadcncraft categories that can fill each slot. Every app header has a
 * sidebar trigger, so a page with one renders inside the sidebar's provider
 * even without a sidebar.
 */
export const LAYOUT_CATEGORIES: Record<
  LayoutSlot,
  readonly { id: string; label: string }[]
> = {
  header: [
    { id: "top-navigation", label: "Website navigation" },
    { id: "app-shell-header", label: "App header" },
  ],
  sidebar: [{ id: "app-shell", label: "App sidebar" }],
  footer: [{ id: "footer", label: "Footer" }],
}

/**
 * Where Jev's layout comes from for each kind: which category fills each
 * slot, if any. Jev picks the variant; whether a slot is filled is policy.
 */
export const KIND_LAYOUT: Record<
  PageKind,
  Record<LayoutSlot, string | null>
> = {
  marketing: {
    header: "top-navigation",
    sidebar: null,
    footer: "footer",
  },
  store: { header: "top-navigation", sidebar: null, footer: "footer" },
  dashboard: {
    header: "app-shell-header",
    sidebar: "app-shell",
    footer: null,
  },
}
