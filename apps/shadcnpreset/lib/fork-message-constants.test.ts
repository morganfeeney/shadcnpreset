import { describe, expect, it } from "vitest"

import { SHADCNPRESET_PRESET_CODE_MESSAGE_TYPE } from "@/lib/shadcnpreset-postmessage"

describe("fork preset postMessage contract", () => {
  it("uses the shared embed message type expected by create/v4", () => {
    // Must match PRESET_CODE_SYNC_MESSAGE_TYPE in the shadcn fork
    // (apps/v4/.../shadcnpreset-fork/constants.ts).
    expect(SHADCNPRESET_PRESET_CODE_MESSAGE_TYPE).toBe("shadcnpreset:preset-code")
  })
})
