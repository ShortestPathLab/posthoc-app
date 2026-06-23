import babel from "@rolldown/plugin-babel";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import path from "path";
import { comlink } from "vite-plugin-comlink";
import { defineConfig } from "vitest/config";

export default defineConfig(({ mode }) => ({
  root: path.join(process.cwd(), "./src"),
  publicDir: mode === "development" ? "public-dev" : "public",
  base: "./",
  build: { outDir: path.join(process.cwd(), "./dist") },
  resolve: { tsconfigPaths: true },
  plugins: [
    // Comlink must be one of the first plugins so it can transform worker
    // imports before other plugins touch them.
    comlink(),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
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
    server: {
      deps: {
        inline: ["vitest-canvas-mock"],
      },
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
    plugins: () => [comlink()],
  },
}));
