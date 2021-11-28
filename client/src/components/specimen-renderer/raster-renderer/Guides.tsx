import { ceil, forEach, range } from "lodash";
import { ComponentProps } from "react";
import { scale } from "./config";
import { makeGraphic } from "./makeGraphic";

const WEIGHT = 1 / scale;

const Grid = makeGraphic<{ alpha?: number; grid?: number }>(
  (g, { width = 0, height = 0, alpha = 1, grid = 5 }) => {
    g.clear();
    g.lineStyle(WEIGHT, 0x000000, alpha);
    forEach(range(grid, height, grid), (i) =>
      g.moveTo(0, i + WEIGHT / 2).lineTo(width, i + WEIGHT / 2)
    );
    forEach(range(grid, width, grid), (i) =>
      g.moveTo(i + WEIGHT / 2, 0).lineTo(i + WEIGHT / 2, height)
    );
  }
);

type Props = ComponentProps<typeof Grid>;

export function Guides({
  width = 0,
  height = 0,
  x = 0,
  y = 0,
  grid = 5,
  ...params
}: Props) {
  return (
    <Grid
      width={ceil((width + 2) / grid) * grid}
      height={ceil((height + 2) / grid) * grid}
      grid={grid}
      {...params}
    />
  );
}
