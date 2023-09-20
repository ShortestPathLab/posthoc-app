import { createMethod } from "./createMethod";
import { entries, keys, map, memoize as memo, startCase } from "lodash";
import { algorithms } from "core/algorithms";
import { handlers } from "core/scenario";

export const features = [
  /**
   * Returns supported algorithms.
   */
  createMethod(
    "features/algorithms",
    memo(async () => {
      return map(entries(algorithms), ([f, { name }]) => ({
        id: f,
        name: name,
        description: f,
      }));
    })
  ),
  /**
   * Returns supported map types.
   */
  createMethod(
    "features/formats",
    memo(async () =>
      map(keys(handlers), (t) => ({
        id: t,
        name: startCase(t),
        description: t,
      }))
    )
  ),
  /**
   * Returns template map descriptors.
   */
  createMethod(
    "features/maps",
    memo(async () => [])
  ),
];
