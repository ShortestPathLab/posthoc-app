import { Dictionary } from "lodash";
import memo from "memoizee";
import { Trace } from "protocol/Trace";
import { Point } from "../Renderer";
import { Scale } from "../Scale";
import { MapInfo } from "./MapInfo";

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
  normalize: (m: MapInfo<M>, specimen?: Trace<K>) => Scale<Point>;
};

export function makeMapParser<T, M extends Dictionary<string>>(
  p: (map: string, options: Partial<T>) => MapInfo<M>
) {
  return memo((m: string = "", o: Partial<T> = {}) => p(m, o), {
    length: 2,
  }) as MapParser<T, M>;
}