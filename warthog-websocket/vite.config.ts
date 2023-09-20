import path from "path";
import { UserConfig } from "vite";
import viteTsconfigPaths from "vite-tsconfig-paths";

export default {
  mode: "production",
  root: path.join(process.cwd(), "./src"),
  build: {
    outDir: path.join(process.cwd(), "./dist"),
    lib: {
      entry: "./index.ts",
      formats: ["es"],
      fileName: "warthog-wasm",
    },
  },
  plugins: [viteTsconfigPaths()],
} as UserConfig;
