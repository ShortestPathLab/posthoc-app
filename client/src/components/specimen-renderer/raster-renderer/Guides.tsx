import { ceil, forEach, range } from "lodash";
import { makeGraphic } from "./makeGraphic";
import { scale } from "./config";
import { ComponentProps } from "react";

const WEIGHT = 1;

const Grid = makeGraphic<{ alpha?: number; grid?: number }>(
  (g, { width = 0, height = 0, alpha = 1, grid = 5 }) => {
    g.clear();
    g.lineStyle(WEIGHT, 0x000000, alpha);
    forEach(range(scale * grid, height, scale * grid), (i) =>
      g.moveTo(0, i + WEIGHT / 2).lineTo(width, i + WEIGHT / 2)
    );
    forEach(range(scale * grid, width, scale * grid), (i) =>
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
      width={ceil((width + 1) / grid) * grid * scale}
      height={ceil((height + 1) / grid) * grid * scale}
      grid={grid}
      {...params}
    />
  );
}
