export function flow<T, R1>(t: T, f1: (t: T) => R1): R1;
export function flow<T, R1, R2>(t: T, f1: (t: T) => R1, f2: (r1: R1) => R2): R2;
export function flow<T, R1, R2, R3>(
  t: T,
  f1: (t: T) => R1,
  f2: (r1: R1) => R2,
  f3: (r2: R2) => R3,
): R3;
export function flow<T, R1, R2, R3, R4>(
  t: T,
  f1: (t: T) => R1,
  f2: (r1: R1) => R2,
  f3: (r2: R2) => R3,
  f4: (r3: R3) => R4,
): R4;
export function flow<T, R1, R2, R3, R4, R5>(
  t: T,
  f1: (t: T) => R1,
  f2: (r1: R1) => R2,
  f3: (r2: R2) => R3,
  f4: (r3: R3) => R4,
  f5: (r4: R4) => R5,
): R5;
export function flow<T, R1, R2, R3, R4, R5, R6>(
  t: T,
  f1: (t: T) => R1,
  f2: (r1: R1) => R2,
  f3: (r2: R2) => R3,
  f4: (r3: R3) => R4,
  f5: (r4: R4) => R5,
  f6: (r5: R5) => R6,
): R6;
export function flow<T, R1, R2, R3, R4, R5, R6, R7>(
  t: T,
  f1: (t: T) => R1,
  f2: (r1: R1) => R2,
  f3: (r2: R2) => R3,
  f4: (r3: R3) => R4,
  f5: (r4: R4) => R5,
  f6: (r5: R5) => R6,
  f7: (r6: R6) => R7,
): R7;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function flow<T>(t: T, ...args: ((t: any) => any)[]): any {
  let current = t;
  for (const a of args) {
    current = a(current);
  }
  return current;
}

type MaybePromise<T> = T | Promise<T>;

// Each step may return a value or a promise; the next step receives the awaited
// result, and the overall result is always a promise.
export function flowAsync<T, R1>(t: T, f1: (t: T) => MaybePromise<R1>): Promise<Awaited<R1>>;
export function flowAsync<T, R1, R2>(
  t: T,
  f1: (t: T) => MaybePromise<R1>,
  f2: (r1: Awaited<R1>) => MaybePromise<R2>,
): Promise<Awaited<R2>>;
export function flowAsync<T, R1, R2, R3>(
  t: T,
  f1: (t: T) => MaybePromise<R1>,
  f2: (r1: Awaited<R1>) => MaybePromise<R2>,
  f3: (r2: Awaited<R2>) => MaybePromise<R3>,
): Promise<Awaited<R3>>;
export function flowAsync<T, R1, R2, R3, R4>(
  t: T,
  f1: (t: T) => MaybePromise<R1>,
  f2: (r1: Awaited<R1>) => MaybePromise<R2>,
  f3: (r2: Awaited<R2>) => MaybePromise<R3>,
  f4: (r3: Awaited<R3>) => MaybePromise<R4>,
): Promise<Awaited<R4>>;
export function flowAsync<T, R1, R2, R3, R4, R5>(
  t: T,
  f1: (t: T) => MaybePromise<R1>,
  f2: (r1: Awaited<R1>) => MaybePromise<R2>,
  f3: (r2: Awaited<R2>) => MaybePromise<R3>,
  f4: (r3: Awaited<R3>) => MaybePromise<R4>,
  f5: (r4: Awaited<R4>) => MaybePromise<R5>,
): Promise<Awaited<R5>>;
export function flowAsync<T, R1, R2, R3, R4, R5, R6>(
  t: T,
  f1: (t: T) => MaybePromise<R1>,
  f2: (r1: Awaited<R1>) => MaybePromise<R2>,
  f3: (r2: Awaited<R2>) => MaybePromise<R3>,
  f4: (r3: Awaited<R3>) => MaybePromise<R4>,
  f5: (r4: Awaited<R4>) => MaybePromise<R5>,
  f6: (r5: Awaited<R5>) => MaybePromise<R6>,
): Promise<Awaited<R6>>;
export function flowAsync<T, R1, R2, R3, R4, R5, R6, R7>(
  t: T,
  f1: (t: T) => MaybePromise<R1>,
  f2: (r1: Awaited<R1>) => MaybePromise<R2>,
  f3: (r2: Awaited<R2>) => MaybePromise<R3>,
  f4: (r3: Awaited<R3>) => MaybePromise<R4>,
  f5: (r4: Awaited<R4>) => MaybePromise<R5>,
  f6: (r5: Awaited<R5>) => MaybePromise<R6>,
  f7: (r6: Awaited<R6>) => MaybePromise<R7>,
): Promise<Awaited<R7>>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function flowAsync<T>(t: T, ...args: ((t: any) => any)[]): Promise<any> {
  let current: any = t;
  for (const a of args) {
    current = await a(current);
  }
  return current;
}
