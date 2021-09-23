import { keys, map, some, startCase } from "lodash-es";
import { parse, relative, resolve } from "path";
import { Trace } from "protocol/Trace";
import { grid } from "./scenario";

export const mapsPath = "./static/maps";

export type MapTypeKey = keyof typeof mapTypes;

/**
 * Applies temporary Y coordinate offset correction.
 * TODO Fix issue in Warthog directly.
 */
function UNSTABLE_offsetY3(trace: Trace<"x" | "y">) {
  return {
    ...trace,
    eventList: map(trace.eventList, (event) => ({
      ...event,
      variables: event.variables
        ? {
            ...event.variables,
            y: event.variables.y - 3,
          }
        : undefined,
    })),
  };
}
export const mapTypes = {
  grid: {
    create: grid,
    transform: UNSTABLE_offsetY3,
  },
};

export function mapIsSupported(path: string) {
  return some(keys(mapTypes), (t) => path.endsWith(`.${t}`));
}

export function getMapDescriptor(path: string) {
  const file = parse(path);
  return {
    id: relative(resolve(mapsPath), path),
    name: startCase(file.name),
    type: file.ext.slice(1),
    description: file.name,
  };
}
