/**
 * Type-safe check for if the specified key exists in the given object, because Typescript is stupid when using the `in` keyword.
 *
 * @template K - The type of the key to check.
 * @template O - The type of the object to check.
 * @param {K} key - The key to check for in the object.
 * @param {O} object - The object to check for the key.
 * @returns {key is Extract<keyof O, K>} - Returns true if the key exists in the object, otherwise false.
 */
export function has<
  K extends string,
  O extends {
    [K in string]: unknown;
  }
>(object: O, key: K): key is Extract<keyof O, K> {
  return key in object;
}
