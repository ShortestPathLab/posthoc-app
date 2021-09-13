import { forEach, range } from "lodash";
import { makeGraphic } from "./makeGraphic";
import { SCALE } from "./constants";

const WEIGHT = 1;

export const Grid = makeGraphic<{ alpha?: number }>(
  (g, { width = 0, height = 0, alpha = 1 }) => {
    g.clear();
    g.lineStyle(WEIGHT, 0x000000, alpha);
    forEach(range(0, height, SCALE * 20), (i) =>
      g.moveTo(0, i + WEIGHT / 2).lineTo(width, i + WEIGHT / 2)
    );
    forEach(range(0, width, SCALE * 20), (i) =>
      g.moveTo(i + WEIGHT / 2, 0).lineTo(i + WEIGHT / 2, height)
    );
  }
);
