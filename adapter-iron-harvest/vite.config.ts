import { UserConfig } from "vite";
import { resolve } from "path";
import viteTsconfigPaths from "vite-tsconfig-paths";
import { builtinModules } from "node:module";

export default {
  mode: "production",
  target: "node16",
  plugins: [viteTsconfigPaths()],
  appType: "custom",
  ssr: {
    format: "cjs",
    target: "node",
    external: builtinModules,
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "./src/index.ts"),
      },
      output: {
        manualChunks: {},
      },
    },
    outDir: "./dist",
    ssr: true,
  },
} as UserConfig;
