import { Graphics } from "@pixi/graphics";
import { map } from "lodash";
import { TraceEvent } from "protocol/Trace";
import { Point } from "../Renderer";
import { Scale } from "../Scale";
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

export type Tri = Edge & {
  c?: Point;
  fill?: number;
  fillAlpha?: number;
};

export type NodeOptions = Partial<Point> & Graphic & Edge & Tri;

export type Draw = (g: Graphics, p: NodeOptions) => Graphics;

export type NodeOptionsMapper<T extends string> = (
  obj?: TraceEvent<T>,
  scale?: Scale
) => NodeOptions;

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

export const tri: Draw = (
  g,
  { color, a, b, c, weight = 1 / scale, fill, fillAlpha = 1 }
) =>
  g
    .lineStyle(weight, color, 1)
    .beginFill(fill, fillAlpha)
    .drawPolygon([
      a?.x ?? 0,
      a?.y ?? 0,
      b?.x ?? 0,
      b?.y ?? 0,
      c?.x ?? 0,
      c?.y ?? 0,
    ])
    .endFill();

export const [Node, Box, Square, Line] = map([node, box, square, line], (f) =>
  makeGraphic<NodeOptions>((g, p) => {
    g.clear();
    f(g, p);
  })
);
