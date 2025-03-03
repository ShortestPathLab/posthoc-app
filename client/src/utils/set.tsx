import type { $, Booleans, Objects, Strings } from "hotscript";
import { get as lodashGet } from "lodash-es";
import type { PlainObject } from "moderndash";
import { set as moderndashSet } from "moderndash";

export type Get<U, TPath extends $<Objects.AllPaths, U>> = $<
  Objects.Get<TPath>,
  U
>;

export function get<U, TPath extends $<Objects.AllPaths, U>>(a: U, b: TPath) {
  return lodashGet(a, b) as Get<U, TPath>;
}
export function set<
  TObj extends PlainObject,
  TPath extends $<Objects.AllPaths, TObj>,
>(obj: TObj, path: TPath, value: $<Objects.Get<TPath>, TObj>): TObj {
  return moderndashSet(obj, path, value);
}

declare global {
  interface String {
    // typesafe 's-t-r-i-n-g'.split('-'): ['s', 't', 'r', 'i', 'n', 'g']
    split<S extends string, D extends string>(
      this: S,
      separator: D
    ): $<Booleans.Equals<S, string>> extends true
      ? string[]
      : $<Strings.Split<D>, S>;
  }
}
