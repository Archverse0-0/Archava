import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{js,jsx,ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      // Scope the measured denominator to this project's own source. Without
      // this, `coverage.all` (on by default) globs the whole working tree and
      // drags every vendored and generated file into the report — the entire
      // OpenZeppelin `scripts/` and `docs/` trees under `contracts/lib/`, plus
      // whatever `node_modules` shipping happens to match. That is thousands of
      // lines no frontend test could ever execute, and it drove the reported
      // repo-wide number down to under 1%, so the thresholds below were
      // measuring library tooling rather than this codebase.
      include: ["src/**/*.{ts,tsx,js,jsx}"],
      exclude: [
        "node_modules/",
        "src/test/",
        "src/main.tsx",
        "src/vite-env.d.ts",
        "**/*.d.ts",
        "**/*.config.*",
      ],
      thresholds: {
        lines: 20,
        functions: 20,
        branches: 15,
        statements: 20,
      },
    },
    globals: true,
  },
});
