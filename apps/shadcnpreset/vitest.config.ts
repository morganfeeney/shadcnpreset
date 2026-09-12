import path from "node:path"
import react from "@vitejs/plugin-react"
import tsconfigPaths from "vite-tsconfig-paths"
import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths({
      root: path.resolve(__dirname),
      ignoreConfigErrors: true,
    }),
  ],
  test: {
    // Node by default — most tests here are pure functions and do not need a
    // DOM. Component and hook tests opt in per file with
    // `// @vitest-environment jsdom`.
    environment: "node",
    include: ["**/*.test.ts", "**/*.test.tsx"],
    exclude: ["node_modules/**", ".next/**"],
    setupFiles: ["./vitest.setup.ts"],
  },
})
