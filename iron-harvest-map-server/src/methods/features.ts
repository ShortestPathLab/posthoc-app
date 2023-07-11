import { readFile as read } from "fs/promises";
import glob from "glob-promise";
import { filter, first, map, memoize as memo } from "lodash";
import { resolve } from "path";
import { getMapDescriptor, mapIsSupported, mapsPath } from "../core/maps";
import { createMethod } from "./createMethod";

async function getFiles(path: string) {
  return await glob(`${resolve(path)}/**/*`);
}

export const features = [
  /**
   * Returns supported algorithms.
   */
  createMethod(
    "features/algorithms",
    memo(async () => [])
  ),
  /**
   * Returns supported map types.
   */
  createMethod(
    "features/formats",
    memo(async () => [])
  ),
  /**
   * Returns template map descriptors.
   */
  createMethod(
    "features/maps",
    memo(async () => {
      const maps = filter(await getFiles(mapsPath), mapIsSupported);
      return map(maps, getMapDescriptor);
    })
  ),
  /**
   * Returns a particular map.
   */
  createMethod(
    "features/map",
    memo(
      async ({ id }) => {
        const map = first(await glob(resolve(mapsPath, id)));
        return map
          ? {
              ...getMapDescriptor(map),
              content: await read(map, "utf8"),
            }
          : undefined;
      },
      ({ id }) => id
    )
  ),
];
