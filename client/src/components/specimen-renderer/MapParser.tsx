import memo from "memoizee";
import { TraceEvent } from "protocol/Trace";
import { Point } from "./Renderer";

export type MapHandler<M extends string = string> = {
  size: Point;
  nodes: {
    [K in M]: TraceEvent[];
  };
  resolve: (point: Point) => Point | undefined;
  getNode: (point: Point) => number | undefined;
  to: (point: Point) => Point;
  from: (point: Point) => Point;
};

export type MapParser<T extends {}, M extends string> = (
  map: string,
  options: Partial<T>
) => MapHandler<M>;

export function makeMapParser<T, M extends string>(p: MapParser<T, M>) {
  return memo((m: string = "", o: Partial<T> = {}) => p(m, o), { length: 2 });
}
