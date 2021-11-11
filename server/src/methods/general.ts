import { createMethod } from "./createMethod";

export const general = [
  /**
   * Returns server information.
   */
  createMethod("about", async () => ({
    name: "Warthog Adapter Server",
    version: "1.0.1",
  })),
];
