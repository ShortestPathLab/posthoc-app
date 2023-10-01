import react from "@vitejs/plugin-react";
import path from "path";
import viteTsconfigPaths from "vite-tsconfig-paths";
import { UserConfig } from "vite";
/// <reference types="vitest" />
export default {
  mode: "production",
  root: path.join(process.cwd(), "./src"),
  base: "./",
  build: { outDir: path.join(process.cwd(), "./dist") },
  plugins: [
    react(),
    viteTsconfigPaths(),
    {
      name: "configure-response-headers",
      configureServer: (server) => {
        server.middlewares.use((_req, res, next) => {
          res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
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
} as UserConfig;