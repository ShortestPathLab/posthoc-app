import { writeFile as write } from "fs/promises";
import { indexOf, lastIndexOf } from "lodash";
import tempy from "tempy";
import { getMap, parseURI } from "../core/map";
import { MapTypeKey } from "../core/maps";
import { handlers } from "../core/scenario";
import { createMethod } from "./createMethod";

const { task: temp } = tempy.file;

/**
 * The maximum size, in UTF-8 characters of a solution,
 * before it is discarded for being too hard.
 * @default 50e6
 */
export const MAX_SOLUTION_SIZE = process.env.MAX_SOLUTION_SIZE
  ? +process.env.MAX_SOLUTION_SIZE
  : 50e6;

async function usingFilePair<T>(task: (a: string, b: string) => Promise<T>) {
  return temp(async (a) => temp(async (b) => await task(a, b)));
}

function trim(out: string) {
  return out.substring(indexOf(out, "{"), lastIndexOf(out, "}") + 1);
}

export const solve = [
  /**
   * Returns a pathfinding solution.
   */
  createMethod(
    "solve/pathfinding",
    ({ algorithm, mapType, mapURI, ...params }) =>
      usingFilePair(async (scenarioPath, mapPath) => {
        const { create, invoke } = handlers[mapType as MapTypeKey];
        const { scheme, content } = parseURI(mapURI);
        // Check if URI scheme is trace,
        // if so, return the URI content
        if (scheme !== "trace:") {
          const m = getMap(mapURI);
          // Check if the URI references a valid map
          if (m) {
            const scenario = create(m, params);
            await Promise.all([
              write(scenarioPath, scenario(mapPath), "utf-8"),
              write(mapPath, m, "utf-8"),
            ]);
            const output = await invoke(algorithm, scenarioPath, mapPath);
            if (output.length > MAX_SOLUTION_SIZE) {
              throw new Error("Solution is too large.");
            }
            return JSON.parse(trim(output));
          }
        } else return JSON.parse(content);
      })
  ),
];
