import { identity, merge } from "lodash";
import { Point } from "./Renderer";

type PointMapper = (point: Point) => Point;

const optional =
  (f: PointMapper) =>
  ({ x, y }: Partial<Point> = {}) =>
    x !== undefined && y !== undefined ? f({ x, y }) : undefined;

export type EventToPropsMapper<T, U> = (a?: T) => U;

export const coerce = (
  { a, b, x, y, x1, x2, y1, y2, ...obj }: any = {},
  to: PointMapper = identity
) => {
  const f = optional(to);
  return merge(
    obj,
    { a: f({ x: x, y: y }) },
    { a: f({ x: x1, y: y1 }) },
    { b: f({ x: x2, y: y2 }) },
    { a: f(a) },
    { b: f(b) }
  );
};
