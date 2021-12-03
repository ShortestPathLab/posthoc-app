import { Graphics } from "@pixi/graphics";
import { map } from "lodash";
import { scale } from "./config";
import { Node as NodeProps } from "../Node";
import { makeGraphic } from "./makeGraphic";

export type Draw = (g: Graphics, p: Node) => Graphics;

export const node = (
  g: Graphics,
  { color, x1 = 0, y1 = 0, radius = 0.25 }: NodeProps
) =>
  g
    .beginFill(color ?? 0x000000)
    .drawCircle(x1, y1, radius)
    .endFill();

export const square = (
  g: Graphics,
  { color, x1 = 0, y1 = 0, radius = 0.5 }: NodeProps
) =>
  g
    .beginFill(color ?? 0x000000)
    .drawRect(-radius / 2 + x1, -radius / 2 + y1, radius, radius)
    .endFill();

export const box = (g: Graphics, { color, x1 = 0, y1 = 0 }: NodeProps) =>
  g
    .beginFill(color ?? 0x000000)
    .drawRect(x1, y1, 1, 1)
    .endFill();

export const line = (
  g: Graphics,
  { color, x1 = 0, y1 = 0, x2 = 0, y2 = 0, weight = 1 / scale }: NodeProps
) => g.moveTo(x1, y1).lineStyle(weight, color, 1).lineTo(x2, y2);

export const [Node, Box, Square, Line] = map([node, box, square, line], (f) =>
  makeGraphic<NodeProps>((g, p) => {
    g.clear();
    f(g, p);
  })
);
