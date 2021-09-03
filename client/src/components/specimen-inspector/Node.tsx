import { makeGraphic } from "./makeGraphic";
import { SCALE } from "./constants";

export const Node = makeGraphic<{ color?: number }>((g, { color }) =>
  g
    .beginFill(color ?? 0x000000)
    .drawCircle(1.5 * SCALE, 1.5 * SCALE, 0.25 * SCALE)
    .endFill()
);
