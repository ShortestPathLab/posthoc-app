import { forEach, range } from "lodash";
import { makeGraphic } from "./makeGraphic";
import { scale } from "./config";

const WEIGHT = 1;
const GRID = 20;

export const Guides = makeGraphic<{ alpha?: number }>(
  (g, { width = 0, height = 0, alpha = 1 }) => {
    g.clear();
    g.lineStyle(WEIGHT, 0x000000, alpha);
    forEach(range(GRID, height, scale * GRID), (i) =>
      g.moveTo(GRID, i + WEIGHT / 2).lineTo(width, i + WEIGHT / 2)
    );
    forEach(range(GRID, width, scale * GRID), (i) =>
      g.moveTo(i + WEIGHT / 2, GRID).lineTo(i + WEIGHT / 2, height)
    );
  }
);
