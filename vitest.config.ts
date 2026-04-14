import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "chrono-node/pt": path.resolve(
        __dirname,
        "node_modules/chrono-node/dist/esm/locales/pt/index.js"
      ),
    },
  },
});
