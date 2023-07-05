import { filter, flatMap as flat, last, map } from "lodash";
import { TraceComponent } from "protocol/Trace";
import { byPoint } from "../NodeMatcher";
import { MapParser } from "../Parser";

const { floor } = Math;

function between(v: number, min: number, max: number) {
  return v >= min && v < max;
}

type Options = {
  wall?: string;
};

export const parse: MapParser = (m = "", { wall = "@" }: Options = {}) => {
  const lines = m.split("\n");
  const [, h = "", w = "", , ...grid] = lines;
  const [width, height] = [w, h].map((d) => +last(d.split(" "))!);

  return {
    bounds: { width, height, minX: 0, minY: 0, maxX: width, maxY: height },
    nodes: filter(
      flat(grid, (row, y) =>
        map(row, (tile, x) =>
          tile === wall
            ? {
                $: "rect",
                width: 1,
                height: 1,
                fill: "#121923",
                alpha: 1,
                x,
                y,
              }
            : undefined
        )
      )
    ) as TraceComponent[],
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
};
