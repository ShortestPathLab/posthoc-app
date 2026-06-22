/**
 * Type-safe cartesian product: given an object whose values are arrays,
 * returns every combination of one value per key.
 *
 * Replaces the `combinate` npm package, whose CJS default export breaks
 * interop under the current bundler (`combinate is not a function`).
 */
export function combinate<O extends Record<string | number, readonly any[]>>(
  obj: O
): { [K in keyof O]: O[K][number] }[] {
  let combos: Record<string, any>[] = [];
  for (const key in obj) {
    const values = obj[key];
    const next: Record<string, any>[] = [];
    for (const value of values) {
      for (const combo of combos.length ? combos : [{}]) {
        next.push({ ...combo, [key]: value });
      }
    }
    combos = next;
  }
  return combos as { [K in keyof O]: O[K][number] }[];
}
