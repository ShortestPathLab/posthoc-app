import { set as moderndashSet } from "moderndash";
import type { Call, Objects, Strings, Booleans } from "hotscript";
import type { PlainObject } from "moderndash";

export function set<
  TObj extends PlainObject,
  TPath extends Call<Objects.AllPaths, TObj>
>(obj: TObj, path: TPath, value: Call<Objects.Get<TPath>, TObj>): TObj {
  return moderndashSet(obj, path, value);
}
declare global {
  interface String {
    // typesafe 's-t-r-i-n-g'.split('-'): ['s', 't', 'r', 'i', 'n', 'g']
    split<S extends string, D extends string>(
      this: S,
      separator: D
    ): Call<Booleans.Equals<S, string>> extends true
      ? string[]
      : Call<Strings.Split<D>, S>;
  }
}
