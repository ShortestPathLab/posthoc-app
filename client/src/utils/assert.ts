import { isNull, isString, isUndefined } from "lodash";

export class AssertionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AssertionError";
  }
}

export function cast<T>(o: unknown): asserts o is T {}

/**
 * Asserts a condition. If the condition is false, throws the given error.
 * If the message is a string, it is used to construct an AssertionError.
 *
 * @param condition the condition to assert
 * @param message the error to throw if the condition is false
 */

export function assert(
  condition: unknown,
  message: string | Error
): asserts condition {
  if (!condition) {
    throw isString(message) ? new AssertionError(message) : message;
  }
}

/**
 * Asserts that the given object is not undefined.
 *
 * @param item the object to assert
 * @param message the error to throw if the condition is false
 * @returns the same object if it is defined
 */
export function required<T>(
  item: T | null | undefined,
  message: string | Error = "Object is undefined"
): T {
  assert(!isNull(item) && !isUndefined(item), message);
  return item;
}
