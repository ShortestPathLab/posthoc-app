import { createMethod } from "./createMethod";

export const general = [
  /**
   * Returns server information.
   */
  createMethod("about", async () => ({
    name: "Iron Harvest Benchmark",
    version: "1.0.0",
    description: "Grid Maps from the Iron Harvest Pathfinding Benchmark",
  })),
];
