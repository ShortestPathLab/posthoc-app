import { Point } from "components/specimen-renderer/Renderer";
import { filter, flatMap as flat, last, map, split } from "lodash";
import { TraceEvent } from "protocol/Trace";

export function parseMap(m: string = "", wall: string = "@") {
  const [, h, w] = split(m, "\n");
  const [width, height] = map([w, h], (d) => +last(split(d, " "))!);
  const grid = split(m, "\n").slice(4);
  return [
    { x: width, y: height },
    filter(
      flat(grid, (row, y) =>
        map(row, (tile, x) =>
          tile === wall ? { variables: { x, y } } : undefined
        )
      )
    ) as TraceEvent[],
    ({ x, y }: Point) => grid[y]?.[x] !== wall,
  ] as const;
}
