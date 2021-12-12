import { Dictionary } from "lodash";
import memo from "memoizee";
import { TraceEvent } from "protocol/Trace";
import { NodeMatcher } from "./NodeMatcher";
import { Point } from "./Size";
import { Bounds, Scale } from "./Size";

export type MapParser<T extends {} = {}, M extends Dictionary<string> = {}> = (
  map?: string,
  options?: Partial<T>
) => MapInfo<M>;

export type MapParserOptions<
  T extends {},
  M extends Dictionary<string>,
  K extends string
> = {
  parse: MapParser<T, M>;
  options?: Partial<T>;
  normalize: (m: MapInfo<M>, steps?: TraceEvent<K>[]) => Scale;
};

export function makeMapParser<T, M extends Dictionary<string>>(
  p: (map: string, options: Partial<T>) => MapInfo<M>
) {
  return memo((m: string = "", o: Partial<T> = {}) => p(m, o), {
    length: 2,
  }) as MapParser<T, M>;
}

export type MapInfo<M extends Dictionary<string> = {}> = {
  bounds: Bounds;
  nodes: {
    [K in keyof M]: TraceEvent<M[K]>[];
  };
  snap: (point: Point, scale?: number) => Point | undefined;
  nodeAt: (point: Point) => number | undefined;
  pointOf: (node: number) => Point | undefined;
  matchNode: NodeMatcher;
};
