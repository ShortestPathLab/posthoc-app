import { Dictionary, first, floor, join, last, map, split } from "lodash";
import { nanoid as id } from "nanoid";
import { ParamsOf } from "protocol/Message";
import { PathfindingTask, PathfindingTaskInstance } from "protocol/SolveTask";
import { roadhog, warthog } from "warthog-bin";

export type MapTypeKey = keyof typeof handlers;

type Params = Omit<
  ParamsOf<PathfindingTask>,
  "algorithm" | "format" | "mapURI"
>;

export function grid(m: string, path: string, { instances }: Params) {
  const [, h, w] = split(m, "\n");
  const [width, height] = map([w, h], (d) => +last(split(d, " "))!);
  return join(
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

function xy(_m: string, _path: string, { instances }: Params) {
  const instance = first(instances);
  if (instance) {
    const { start = 0, end = 0 } = instance;
    return `p aux sp p2p 1\nq ${start + 1} ${end + 1}\n`;
  }
}

export const handlers = {
  grid: {
    invoke: async (alg, instances, m) => {
      const [a, b] = [id(), id()];
      const scen = grid(m, a, { instances });
      const { stdout, stderr } = await warthog({
        preRun: (m2) => {
          m2.FS!.writeFile(a, m);
          m2.FS!.writeFile(b, scen);
        },
        args: ["--alg", alg, "--scen", b, "--verbose"],
      });
      if (stderr) console.log(stderr);
      return stdout;
    },
  },
  xy: {
    invoke: async (alg, instances, m) => {
      const [a, b] = [id(), id()];
      const scen = xy(m, a, { instances });
      const { stdout } = await roadhog({
        preRun: (m2) => {
          m2.FS!.writeFile(a, m);
          m2.FS!.writeFile(b, scen ?? "");
        },
        args: ["--alg", alg, "--problem", b, "--input", m],
      });
      return stdout;
    },
  },
} satisfies Dictionary<Handler>;

type Handler = {
  invoke: (
    alg: string,
    instances: PathfindingTaskInstance[],
    map: string
  ) => Promise<string>;
};
