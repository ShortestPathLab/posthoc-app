/**
 * A utility type that extracts the overload signatures of a function type `T` and represents them as a union of function types.
 *
 * This type recursively checks for up to 7 overloads in the function type `T` and constructs a union of function types
 * corresponding to each overload signature.
 *
 * @template T - The function type from which to extract overloads.
 *
 * @example
 * type Example = Overloads<{
 *   (x: number): string;
 *   (x: string): number;
 * }>;
 * // Result: ((x: number) => string) | ((x: string) => number)
 */
export type Overloads<T> = T extends {
  (...o: infer A1): infer R1;
  (...o: infer A2): infer R2;
  (...o: infer A3): infer R3;
  (...o: infer A4): infer R4;
  (...o: infer A5): infer R5;
  (...o: infer A6): infer R6;
  (...o: infer A7): infer R7;
}
  ?
      | ((...o: A1) => R1)
      | ((...o: A2) => R2)
      | ((...o: A3) => R3)
      | ((...o: A4) => R4)
      | ((...o: A5) => R5)
      | ((...o: A6) => R6)
      | ((...o: A7) => R7)
  : T extends {
      (...o: infer A1): infer R1;
      (...o: infer A2): infer R2;
      (...o: infer A3): infer R3;
      (...o: infer A4): infer R4;
      (...o: infer A5): infer R5;
      (...o: infer A6): infer R6;
    }
  ?
      | ((...o: A1) => R1)
      | ((...o: A2) => R2)
      | ((...o: A3) => R3)
      | ((...o: A4) => R4)
      | ((...o: A5) => R5)
      | ((...o: A6) => R6)
  : T extends {
      (...o: infer A1): infer R1;
      (...o: infer A2): infer R2;
      (...o: infer A3): infer R3;
      (...o: infer A4): infer R4;
      (...o: infer A5): infer R5;
    }
  ?
      | ((...o: A1) => R1)
      | ((...o: A2) => R2)
      | ((...o: A3) => R3)
      | ((...o: A4) => R4)
      | ((...o: A5) => R5)
  : T extends {
      (...o: infer A1): infer R1;
      (...o: infer A2): infer R2;
      (...o: infer A3): infer R3;
      (...o: infer A4): infer R4;
    }
  ?
      | ((...o: A1) => R1)
      | ((...o: A2) => R2)
      | ((...o: A3) => R3)
      | ((...o: A4) => R4)
  : T extends {
      (...o: infer A1): infer R1;
      (...o: infer A2): infer R2;
      (...o: infer A3): infer R3;
    }
  ? ((...o: A1) => R1) | ((...o: A2) => R2) | ((...o: A3) => R3)
  : T extends {
      (...o: infer A1): infer R1;
      (...o: infer A2): infer R2;
    }
  ? ((...o: A1) => R1) | ((...o: A2) => R2)
  : T extends {
      (...o: infer A1): infer R1;
    }
  ? (...o: A1) => R1
  : never;
