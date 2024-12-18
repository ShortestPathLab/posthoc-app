/// <reference types="vitest" />

import path from "path";
import { UserConfig } from "vite";
import viteTsconfigPaths from "vite-tsconfig-paths";

export default {
  root: path.join(process.cwd(), "./src"),
  plugins: [viteTsconfigPaths()],
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
