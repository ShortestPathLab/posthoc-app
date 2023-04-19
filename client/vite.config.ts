import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react({ fastRefresh: false })],
  worker: {
    plugins: [react()],
  },
  base: "/app",
  build: {
    outDir: path.join(process.cwd(), "./build"),
  },
  root: path.join(process.cwd(), "./src"),
  publicDir: path.join(process.cwd(), "./public"),
  resolve: {
    alias: {
      client: "/client",
      components: "/components",
      hooks: "/hooks",
      services: "/services",
      slices: "/slices",
      workers: "/workers",
      theme: "/theme",
      "index.css": "/index.css",
      App: "/App",
    },
  },
});
