import { createMethod } from "./createMethod";
import { getConfig } from "../config";
export const general = [
  /**
   * Returns server information.
   */
  createMethod("about", async () => {
    const { name, version, description } = getConfig();
    return { name, version, description };
  }),
];
