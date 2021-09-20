import { makeGraphic } from "./makeGraphic";
import { scale } from "./config";
import { Graphics } from "@pixi/graphics";

export type NodeProps = {
  color?: number;
  left?: number;
  top?: number;
  radius?: number;
};

export const drawNode = (
  g: Graphics,
  { color, left = 0, top = 0, radius = 0.25 }: NodeProps
) =>
  g
    .beginFill(color ?? 0x000000)
    .drawCircle(1.5 * scale + left, 1.5 * scale + top, radius * scale)
    .endFill();

export const Node = makeGraphic<NodeProps>((g, p) => {
  g.clear();
  drawNode(g, p);
});
