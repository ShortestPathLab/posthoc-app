/// <reference types="vitest" />

import path from "path";
import { UserConfig } from "vite";
import viteTsconfigPaths from "vite-tsconfig-paths";
import react from "@vitejs/plugin-react";

export default {
  mode: "production",
  root: path.join(process.cwd(), "./src"),
  build: { outDir: path.join(process.cwd(), "./dist") },
  plugins: [react(), viteTsconfigPaths()],
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
