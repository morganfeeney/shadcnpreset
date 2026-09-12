import { cleanup } from "@testing-library/react"
import { afterEach } from "vitest"

// Unmount between tests so a leaked tree cannot answer the next test's
// queries. No-op in the node environment, where nothing was ever mounted.
afterEach(() => {
  cleanup()
})

// jsdom has no layout, so the browser APIs our scroll containers reach for on
// mount are missing rather than merely inert. Stub them where a DOM exists.
if (typeof window !== "undefined") {
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  window.HTMLElement.prototype.scrollIntoView ??= () => {}

  window.matchMedia ??= ((query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList) as typeof window.matchMedia
}
