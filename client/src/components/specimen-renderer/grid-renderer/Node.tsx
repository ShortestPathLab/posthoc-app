import { makeGraphic } from "./makeGraphic";
import { scale } from "./config";
import { Graphics } from "@pixi/graphics";

export type NodeProps = {
  color?: number;
  left?: number;
  top?: number;
  radius?: number;
  resolution?: number;
};

export const point = (
  g: Graphics,
  { color, left = 0, top = 0, radius = 0.25, resolution: r = 1 }: NodeProps
) =>
  g
    .beginFill(color ?? 0x000000)
    .drawCircle(
      r * (1.5 * scale + left),
      r * (1.5 * scale + top),
      r * radius * scale
    )
    .endFill();

export const square = (
  g: Graphics,
  { color, left = 0, top = 0, radius = 0.25, resolution: r = 1 }: NodeProps
) =>
  g
    .beginFill(color ?? 0x000000)
    .drawRect(
      r * (1.25 * scale + (radius * scale) / 2 + left),
      r * (1.25 * scale + (radius * scale) / 2 + top),
      r * (radius * scale),
      r * (radius * scale)
    )
    .endFill();

export const box = (
  g: Graphics,
  { color, left = 0, top = 0, resolution: r = 1 }: NodeProps
) =>
  g
    .beginFill(color ?? 0x000000)
    .drawRect(
      r * (scale + left),
      r * (scale + top),
      r * (1 * scale),
      r * (1 * scale)
    )
    .endFill();

export const Node = makeGraphic<NodeProps>((g, p) => {
  g.clear();
  point(g, p);
});
