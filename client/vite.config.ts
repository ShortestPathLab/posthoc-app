/// <reference types="vitest" />

import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig, Plugin, UserConfig } from "vite";
import viteTsconfigPaths from "vite-tsconfig-paths";

const ReactCompilerConfig = {
  /* ... */
};

export default defineConfig(
  ({ mode }): UserConfig => ({
    root: path.join(process.cwd(), "./src"),
    publicDir: mode === "development" ? "public-dev" : "public",
    base: "./",
    build: { outDir: path.join(process.cwd(), "./dist") },
    plugins: [
      viteTsconfigPaths(),
      react({
        babel: {
          plugins: [["babel-plugin-react-compiler", ReactCompilerConfig]],
        },
      }) as Plugin[],
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
      setupFiles: "./setupTests.ts",
      environment: "jsdom",
      environmentOptions: {
        jsdom: {
          resources: "usable",
        },
      },
    },
    worker: {
      plugins: () => [viteTsconfigPaths()],
    },
  })
);
