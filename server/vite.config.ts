import { UserConfig } from "vite";
import viteTsconfigPaths from "vite-tsconfig-paths";

export default {
  plugins: [viteTsconfigPaths()],
} as UserConfig;
