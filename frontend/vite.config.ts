// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/vite.config.ts

import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig as defineVitestConfig } from "vitest/config";
import path from "node:path";

// Resolve API target depending on environment
const API_TARGET = process.env.VITE_API_PROXY_TARGET || "http://localhost:8000";

// https://vite.dev/config/
export default defineVitestConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    proxy: {
      "/api": {
        target: API_TARGET,
        changeOrigin: true,
      },
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
