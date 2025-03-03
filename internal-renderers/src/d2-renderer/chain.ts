export function chain<T, R1>(t: T, f1: (t: T) => R1): R1;
export function chain<T, R1, R2>(
  t: T,
  f1: (t: T) => R1,
  f2: (r1: R1) => R2
): R2;
export function chain<T, R1, R2, R3>(
  t: T,
  f1: (t: T) => R1,
  f2: (r1: R1) => R2,
  f3: (r2: R2) => R3
): R3;
export function chain<T, R1, R2, R3, R4>(
  t: T,
  f1: (t: T) => R1,
  f2: (r1: R1) => R2,
  f3: (r2: R2) => R3,
  f4: (r3: R3) => R4
): R4;
export function chain<T, R1, R2, R3, R4, R5>(
  t: T,
  f1: (t: T) => R1,
  f2: (r1: R1) => R2,
  f3: (r2: R2) => R3,
  f4: (r3: R3) => R4,
  f5: (r4: R4) => R5
): R5;
export function chain<T, R1, R2, R3, R4, R5, R6>(
  t: T,
  f1: (t: T) => R1,
  f2: (r1: R1) => R2,
  f3: (r2: R2) => R3,
  f4: (r3: R3) => R4,
  f5: (r4: R4) => R5,
  f6: (r5: R5) => R6
): R6;
export function chain<T, R1, R2, R3, R4, R5, R6, R7>(
  t: T,
  f1: (t: T) => R1,
  f2: (r1: R1) => R2,
  f3: (r2: R2) => R3,
  f4: (r3: R3) => R4,
  f5: (r4: R4) => R5,
  f6: (r5: R5) => R6,
  f7: (r6: R6) => R7
): R7;
export function chain<T>(t: T, ...args: ((t: any) => any)[]): any {
  let current = t;
  for (const a of args) {
    current = a(current);
  }
  return current;
}

export const _ = chain;
