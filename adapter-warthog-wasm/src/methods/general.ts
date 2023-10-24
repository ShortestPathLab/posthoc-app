import { createMethod } from "./createMethod";

export const general = [
  /**
   * Returns server information.
   */
  createMethod("about", async () => ({
    name: "Warthog (WebAssembly)",
    version: "1.0.5",
    description: "Solver Adapter for Warthog & Roadhog",
  })),
];
