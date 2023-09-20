import { filter, trimEnd } from "lodash";
import { Trace } from "protocol";
import { PathfindingTaskInstance } from "protocol/SolveTask";
import { getMap, parseURI } from "core/map";
import { MapTypeKey, handlers } from "core/scenario";
import { createMethod } from "./createMethod";

/**
 * The maximum size, in UTF-8 characters of a solution,
 * before it is discarded for being too hard.
 * @default 50e6
 */
export const MAX_SOLUTION_SIZE = 50e6;

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
    async ({ algorithm, format, mapURI, instances: inst }) => {
      if (!algorithm) throw new Error("Select an algorithm.");
      const { invoke, template } = handlers[format as MapTypeKey];
      const { scheme, content } = parseURI(mapURI);
      // Check if URI scheme is trace,
      // if so, return the URI content
      if (scheme === "trace:") return JSON.parse(content);
      const m = getMap(mapURI);
      // Check if the URI references a valid map
      if (!m) return;
      const instances = validateInstances(inst);
      // Check if there are any instances to solve
      if (!instances) throw new Error("Nothing to solve.");
      const output = await invoke(algorithm, inst, m);
      if (output.length > MAX_SOLUTION_SIZE)
        throw new Error("Solution is too large.");
      return parse(output, template);
    }
  ),
];
