import { createMethod } from "./createMethod";

export const general = [
  /**
   * Returns server information.
   */
  createMethod("about", async () => ({
    name: "Warthog",
    version: "1.0.2",
    description: "Solver Adapter for Warthog & Roadhog",
  })),
];
