import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  resolve: {
    alias: [
      { find: "@", replacement: resolve(__dirname, "./") },
      { find: "@lib", replacement: resolve(__dirname, "./lib") },
      { find: "@schemas", replacement: resolve(__dirname, "./lib/schemas") },
      { find: "@data", replacement: resolve(__dirname, "./lib/data") },
    ],
  },
  test: {
    include: ["tests/**/*.test.ts"],
    exclude: ["tests/e2e/**"],
    environment: "happy-dom",
    globals: true,
    coverage: {
      reporter: ["text", "json", "html"],
    },
  },
});
