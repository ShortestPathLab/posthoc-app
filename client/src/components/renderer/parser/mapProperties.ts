import { Properties as Props } from "protocol";
import { Context } from "./Context";

/**
 * Iterates over the properties of a scope or component,
 * ignoring the component name property `$`.
 * @param context The properties to iterate against.
 * @param f
 * @returns
 */
export function mapProperties<T extends Props, TResult>(
  context: Context<T> = {},
  f: (value: T[keyof T], key: string, context: Context<T>) => TResult,
): Context<T> & { $: string } {
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(context)) {
    out[key] = key === "$" ? context[key] : f(context[key], key, context);
  }
  return Object.setPrototypeOf(out, context);
}
