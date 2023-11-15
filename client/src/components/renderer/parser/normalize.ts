import { isFunction } from "lodash";
import { Properties as Props } from "protocol";
import { Context, PropMap } from "./Context";
import { mapProperties } from "./mapProperties";
import { parseProperty } from "./parseProperty";

export function normalize<T extends Props>(
  context: Context<T> = {}
): PropMap<T> {
  return mapProperties(context, (v) => (isFunction(v) ? v : parseProperty(v)));
}

export function normalizeConstant(obj: Context<any> = {}) {
  return new Proxy(obj, {
    get: (obj, p) => (typeof obj[p] === "function" ? obj[p] : () => obj[p]),
  });
}
