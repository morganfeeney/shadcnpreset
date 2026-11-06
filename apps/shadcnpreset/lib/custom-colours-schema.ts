import { z } from "zod"

import { BRAND_TOKENS, isUsableColour } from "@/lib/brand-theme"

const colour = z.string().trim().min(1).max(64).refine(isUsableColour)

/** A custom preset's colours as a request sends them. */
export const customColoursSchema = z.object({
  baseColor: colour.optional(),
  theme: colour.optional(),
  chartColor: colour.optional(),
  overrides: z.record(z.enum(BRAND_TOKENS), colour),
})
