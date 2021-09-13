import { makeGraphic } from "./makeGraphic";
import { SCALE } from "./constants";
import { Graphics } from "@pixi/graphics";

export type NodeProps = { color?: number; x?: number; y?: number };

export const drawNode = (g: Graphics, { color, x = 0, y = 0 }: NodeProps) =>
  g
    .beginFill(color ?? 0x000000)
    .drawCircle(1.5 * SCALE + x, 1.5 * SCALE + y, 0.25 * SCALE)
    .endFill();

export const Node = makeGraphic<NodeProps>(drawNode);
