/// <reference types="vitest" />

import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import viteTsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => ({
  root: path.join(process.cwd(), "./src"),
  publicDir: mode === "development" ? "public-dev" : "public",
  base: "./",
  build: { outDir: path.join(process.cwd(), "./dist") },
  plugins: [
    react(),
    viteTsconfigPaths(),
    {
      name: "configure-response-headers",
      configureServer: (server) => {
        server.middlewares.use((_req, res, next) => {
          res.setHeader("Cross-Origin-Embedder-Policy", "credentialless");
          res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
          next();
        });
      },
    },
  ],
  test: {
    globals: true,
    deps: {
      inline: ["vitest-canvas-mock"],
    },
    threads: false,
    setupFiles: "./setupTests.ts",
    environment: "jsdom",
    environmentOptions: {
      jsdom: {
        resources: "usable",
      },
    },
  },
}));
