import { isString } from "lodash-es";

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
