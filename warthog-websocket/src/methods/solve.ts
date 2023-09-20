import { writeFile as write } from "fs/promises";
import { filter, indexOf, lastIndexOf, trimEnd } from "lodash";
import { Trace } from "protocol";
import { PathfindingTaskInstance } from "protocol/SolveTask";
import tempy from "tempy";
import { getMap, parseURI } from "../core/map";
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

function validateInstances(instances: PathfindingTaskInstance[]) {
  const filtered = filter(
    instances,
    ({ start, end }) => ![start, end].includes(undefined)
  );
  return filtered.length ? filtered : undefined;
}

function parseBasic(output: string) {
  const lines = output.split("\n").filter((c) => c.startsWith(`{"type"`));
  return lines.map((l) => trimEnd(l, ",")).map((l) => JSON.parse(l));
}

function parse(output: string, template: Partial<Trace>) {
  const lines = parseBasic(output);
  return {
    ...template,
    events: lines.map((c) => {
      return {
        type: c.type,
        id: c.id,
        x: c.variables.x,
        y: c.variables.y,
        pId: c.pId,
        g: c.f,
        f: c.g,
      };
    }),
  };
}
export const solve = [
  /**
   * Returns a pathfinding solution.
   */
  createMethod(
    "solve/pathfinding",
    ({ algorithm, format, mapURI, instances: inst }) =>
      usingFilePair(async (scenarioPath, mapPath) => {
        if (algorithm) {
          const { create, invoke, template } =
            handlers[format as "grid" | "xy"];
          const { scheme, content } = parseURI(mapURI);
          // Check if URI scheme is trace,
          // if so, return the URI content
          if (scheme !== "trace:") {
            const m = getMap(mapURI);
            // Check if the URI references a valid map
            if (m) {
              const instances = validateInstances(inst);
              // Check if there are any instances to solve
              if (instances) {
                const scenario = create(m, { instances });
                await Promise.all([
                  write(scenarioPath, scenario(mapPath), "utf-8"),
                  write(mapPath, m, "utf-8"),
                ]);
                const output = await invoke(algorithm, scenarioPath, mapPath);
                if (output.length > MAX_SOLUTION_SIZE) {
                  throw new Error("Solution is too large.");
                }
                return parse(trim(output), template);
              } else throw new Error("Nothing to solve.");
            }
          } else return JSON.parse(content);
        } else throw new Error("Select an algorithm.");
      })
  ),
];
