import {
  constant,
  Dictionary,
  first,
  floor,
  join,
  last,
  map,
  split,
} from "lodash";
import { roadhog, warthog } from "pathfinding-binaries";
import { ParamsOf } from "protocol/Message";
import { PathfindingTask } from "protocol/SolveTask";
import { exec } from "../helpers/exec";

type Params = Omit<
  ParamsOf<PathfindingTask>,
  "algorithm" | "format" | "mapURI"
>;

export function grid(m: string, { instances }: Params) {
  const [, h, w] = split(m, "\n");
  const [width, height] = map([w, h], (d) => +last(split(d, " "))!);
  return (path: string) =>
    join(
      [
        "version 1",
        ...map(instances, ({ start, end }) =>
          join(
            [
              0,
              path,
              width,
              height,
              start! % width,
              floor(start! / width),
              end! % width,
              floor(end! / width),
              0,
            ],
            " "
          )
        ),
      ],
      "\n"
    );
}

export const handlers = {
  grid: {
    create: grid,
    invoke: (alg, scen) =>
      exec(warthog, { args: { alg, scen }, flags: ["verbose"] }, true),
  },
  xy: {
    create: (_, { instances }) => {
      const instance = first(instances);
      if (instance) {
        const { start = 0, end = 0 } = instance;
        return constant(`p aux sp p2p 1\nq ${start + 1} ${end + 1}\n`);
      }
    },
    invoke: (alg, scen, m) =>
      exec(
        roadhog,
        { args: { alg, problem: scen, input: m }, flags: ["verbose"] },
        true
      ),
  },
} as Dictionary<Handler>;

type Handler = {
  create: (m: string, params: Params) => (path: string) => string;
  invoke: (
    alg: string,
    scenarioPath: string,
    mapPath: string
  ) => Promise<string>;
};
