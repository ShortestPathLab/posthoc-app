import { constant, map, mapValues } from "lodash";
import { Prop } from "./Context";
import { parseString } from "./parseString";
/**
 * Parses a single property (recursively calling down if required)
 * @param prop the value of the property to parse
 * @param context additional context for the property
 * @returns a Function which takes in context and returns the properties value
 */
export function parseProperty(prop: any): Prop<any> {
  switch (prop?.constructor) {
    case Array: {
      const parsed = map(prop, parseProperty);
      return (ctx) => map(parsed, (f) => f(ctx));
    }
    case Object: {
      const parsed = mapValues(prop, parseProperty);
      return (ctx) => mapValues(parsed, (f) => f(ctx));
    }
    case String:
      return parseString(prop);
    default:
      return constant(prop);
  }
}
