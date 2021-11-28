import { Graphics } from "@pixi/graphics";
import { map } from "lodash";
import { scale } from "./config";
import { makeGraphic } from "./makeGraphic";

const WEIGHT = 1.5 / scale;

export type GraphicProps = {
  color?: number;
  resolution?: number;
  radius?: number;
};

export type LineProps = {
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
};

export type NodeProps = GraphicProps & LineProps;

export const coerce = (obj: any) => ({
  x1: obj.x,
  y1: obj.y,
  ...obj,
});

export const node = (
  g: Graphics,
  { color, x1 = 0, y1 = 0, radius = 0.25, resolution: r = 1 }: NodeProps
) =>
  g
    .beginFill(color ?? 0x000000)
    .drawCircle(r * (1.5 + x1), r * (1.5 + y1), r * radius)
    .endFill();

export const square = (
  g: Graphics,
  { color, x1 = 0, y1 = 0, radius = 0.5, resolution: r = 1 }: NodeProps
) =>
  g
    .beginFill(color ?? 0x000000)
    .drawRect(
      r * (radius / 2 + x1),
      r * (radius / 2 + y1),
      r * radius,
      r * radius
    )
    .endFill();

export const box = (
  g: Graphics,
  { color, x1 = 0, y1 = 0, resolution: r = 1 }: NodeProps
) =>
  g
    .beginFill(color ?? 0x000000)
    .drawRect(r * x1, r * y1, r * 1, r * 1)
    .endFill();

export const line = (
  g: Graphics,
  { color, x1 = 0, y1 = 0, x2 = 0, y2 = 0 }: NodeProps
) => g.moveTo(x1, y1).lineStyle(WEIGHT, color, 1).lineTo(x2, y2);

export const [Node, Box, Square, Line] = map([node, box, square, line], (f) =>
  makeGraphic<NodeProps>((g, p) => {
    g.clear();
    f(g, p);
  })
);
