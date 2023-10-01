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