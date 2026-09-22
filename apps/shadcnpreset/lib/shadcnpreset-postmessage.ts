/**
 * postMessage type for v4 iframe → shadcnpreset parent preset URL sync.
 * Must match `PRESET_CODE_SYNC_MESSAGE_TYPE` in v4 `shadcnpreset-fork/constants.ts`.
 */
export const SHADCNPRESET_PRESET_CODE_MESSAGE_TYPE =
  "shadcnpreset:preset-code" as const

/**
 * postMessage type for shadcnpreset parent → v4 preview iframe: re-theme in
 * place without reloading. Must match the `useIframeMessageListener` type in
 * v4 `design-system-provider.tsx`, which applies `data` with history "replace".
 */
export const V4_DESIGN_SYSTEM_PARAMS_MESSAGE_TYPE =
  "design-system-params" as const
