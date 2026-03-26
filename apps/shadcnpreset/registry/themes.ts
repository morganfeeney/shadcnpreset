import { THEMES as V4_THEMES } from "../../v4/registry/themes"

export const THEMES = V4_THEMES

export type Theme = (typeof THEMES)[number]
