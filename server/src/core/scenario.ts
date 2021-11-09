import { Dictionary } from "lodash";
import { floor, join, last, map, split, constant } from "lodash-es";
import { roadhog, warthog } from "pathfinding-binaries";
import { ParamsOf } from "protocol/Message";
import { PathfindingTask } from "protocol/SolveTask";
import { exec } from "../helpers/exec";

type Params = Pick<ParamsOf<PathfindingTask>, "start" | "end">;

export function grid(m: string, { start, end }: Params) {
  const [, h, w] = split(m, "\n");
  const [width, height] = map([w, h], (d) => +last(split(d, " "))!);
  return (path: string) =>
    join(
      [
        "version 1",
        join(
          [
            0,
            path,
            width,
            height,
            start % width,
            floor(start / width),
            end % width,
            floor(end / width),
            0,
          ],
          " "
        ),
      ],
      "\n"
    );
}

export const handlers = {
  grid: {
    create: grid,
    invoke: (alg, scen) =>
      exec(
        warthog,
        {
          flags: {
            alg: { value: alg },
            scen: { value: scen },
            verbose: {},
          },
        },
        true
      ),
  },
  // xy: {
  //   create: (_, { start, end }) =>
  //     constant(join(["p aux sp p2p-zero 1", `q ${start} ${end}`], "\n")),
  //   invoke: async (alg, scen, m) =>
  //     exec(
  //       roadhog,
  //       {
  //         flags: {
  //           alg: { value: alg },
  //           problem: { value: scen },
  //           input: { value: m },
  //           verbose: {},
  //         },
  //       },
  //       true
  //     ),
  // },
} as Dictionary<Handler>;

type Handler = {
  create: (m: string, params: Params) => (path: string) => string;
  invoke: (
    alg: string,
    scenarioPath: string,
    mapPath: string
  ) => Promise<string>;
};
