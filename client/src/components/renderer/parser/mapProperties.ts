import { mapValues, ObjectIterator } from "lodash";
import { Properties as Props } from "protocol";
import { Context } from "./Context";
/**
 * Iterates over the properties of a scope or component,
 * ignoring the component name property `$`.
 * @param context The properties to iterate against.
 * @param iterator
 * @returns
 */
export function mapProperties<T extends Props, TResult>(
  context: Context<T> = {},
  iterator: ObjectIterator<T, TResult>
): Context<T> & { $: string } {
  const { $, ...props } = context;
  return {
    ...mapValues(props, iterator),
    $,
  };
}
