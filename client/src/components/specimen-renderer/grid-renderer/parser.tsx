import { filter, flatMap as flat, last, map } from "lodash";
import { TraceEvent } from "protocol/Trace";
import { makeMapParser } from "../MapParser";
import { Point } from "../Renderer";

const { floor } = Math;

function between(v: number, min: number, max: number) {
  return v >= min && v < max;
}

type Options = {
  wall?: string;
};

export const parser = makeMapParser((m, { wall = "@" }: Options) => {
  const lines = m.split("\n");
  const [, h, w, , ...grid] = lines;
  const [width, height] = [w, h].map((d) => +last(d.split(" "))!);

  const to = ({ x, y }: Point) => ({ x: x + 0.5, y: y + 0.5 });
  const from = ({ x, y }: Point) => ({ x: x - 0.5, y: y - 0.5 });

  return {
    size: { x: width, y: height },
    nodes: {
      walls: filter(
        flat(grid, (row, y) =>
          map(row, (tile, x) =>
            tile === wall ? { variables: { x, y } } : undefined
          )
        )
      ) as TraceEvent[],
    },
    resolve: ({ x: x1, y: y1 }) => {
      const [x, y] = [floor(x1), floor(y1)];
      if (
        between(x, 0, width) &&
        between(y, 0, height) &&
        grid[y]?.[x] !== wall
      )
        return to({ x, y });
    },
    getNode: (point) => {
      const { x, y } = from(point);
      return y * width + x;
    },
    to,
    from,
  };
});
