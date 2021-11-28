import { makeGraphic } from "./makeGraphic";
import { Graphics } from "@pixi/graphics";
import { map } from "lodash";

export type GraphicProps = {
  color?: number;
  resolution?: number;
};

export type NodeProps = GraphicProps & {
  left?: number;
  top?: number;
  radius?: number;
};

export const node = (
  g: Graphics,
  { color, left = 0, top = 0, radius = 0.25, resolution: r = 1 }: NodeProps
) =>
  g
    .beginFill(color ?? 0x000000)
    .drawCircle(r * (1.5 + left), r * (1.5 + top), r * radius)
    .endFill();

export const square = (
  g: Graphics,
  { color, left = 0, top = 0, radius = 0.5, resolution: r = 1 }: NodeProps
) =>
  g
    .beginFill(color ?? 0x000000)
    .drawRect(
      r * (radius / 2 + left),
      r * (radius / 2 + top),
      r * radius,
      r * radius
    )
    .endFill();

export const box = (
  g: Graphics,
  { color, left = 0, top = 0, resolution: r = 1 }: NodeProps
) =>
  g
    .beginFill(color ?? 0x000000)
    .drawRect(r * left, r * top, r * 1, r * 1)
    .endFill();

export const [Node, Box, Square] = map([node, box, square], (f) =>
  makeGraphic<NodeProps>((g, p) => {
    g.clear();
    f(g, p);
  })
);
