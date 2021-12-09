import { Graphics } from "@pixi/graphics";
import { map } from "lodash";
import { Point } from "../Renderer";
import { scale } from "./config";
import { makeGraphic } from "./makeGraphic";

export type Graphic = {
  color?: number;
  radius?: number;
};

export type Edge = {
  weight?: number;
  a?: Point;
  b?: Point;
};

export type NodeOptions = Partial<Point> & Graphic & Edge;

export type Draw = (g: Graphics, p: NodeOptions) => Graphics;

export const node: Draw = (g, { color, a, radius = 0.25 }) =>
  g
    .beginFill(color ?? 0x000000)
    .drawCircle(a?.x ?? 0, a?.y ?? 0, radius)
    .endFill();

export const square: Draw = (g, { color, a, radius = 0.5 }) =>
  g
    .beginFill(color ?? 0x000000)
    .drawRect(
      (a?.x ?? 0) - radius / 2,
      (a?.y ?? 0) - radius / 2,
      radius,
      radius
    )
    .endFill();

export const box: Draw = (g, { color, a, radius = 1 }) =>
  g
    .beginFill(color ?? 0x000000)
    .drawRect(
      (a?.x ?? 0) - radius / 2,
      (a?.y ?? 0) - radius / 2,
      radius,
      radius
    )
    .endFill();

export const line: Draw = (g, { color, a, b, weight = 1 / scale }) =>
  g
    .moveTo(a?.x ?? 0, a?.y ?? 0)
    .lineStyle(weight, color, 1)
    .lineTo(b?.x ?? 0, b?.y ?? 0);

export const [Node, Box, Square, Line] = map([node, box, square, line], (f) =>
  makeGraphic<NodeOptions>((g, p) => {
    g.clear();
    f(g, p);
  })
);
