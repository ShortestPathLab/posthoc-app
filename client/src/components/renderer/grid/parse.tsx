import { filter, flatMap as flat, last, map } from "lodash";
import { TraceEvent } from "protocol/Trace";
import { makeMapParser } from "../Parser";
import { byPoint } from "../NodeMatcher";
import { Structure } from "./Structure";

const { floor } = Math;

function between(v: number, min: number, max: number) {
  return v >= min && v < max;
}

type Options = {
  wall?: string;
};

export const parse = makeMapParser<Options, Structure>(
  (m, { wall = "@" }: Options) => {
    const lines = m.split("\n");
    const [, h = "", w = "", , ...grid] = lines;
    const [width, height] = [w, h].map((d) => +last(d.split(" "))!);

    return {
      bounds: { width, height, minX: 0, minY: 0, maxX: width, maxY: height },
      nodes: {
        walls: filter(
          flat(grid, (row, y) =>
            map(row, (tile, x) =>
              tile === wall ? { variables: { x, y } } : undefined
            )
          )
        ) as TraceEvent[],
      },
      snap: ({ x: x1, y: y1 }, scale = 1) => {
        const [x, y] = [floor(x1 + scale / 2), floor(y1 + scale / 2)];
        if (
          between(x, 0, width) &&
          between(y, 0, height) &&
          grid[y]?.[x] !== wall
        )
          return { x, y };
      },
      nodeAt: (point) => {
        const { x, y } = point;
        return y * width + x;
      },
      pointOf: (node) => ({ x: node % width, y: ~~(node / width) }),
      matchNode: byPoint,
    };
  }
);
