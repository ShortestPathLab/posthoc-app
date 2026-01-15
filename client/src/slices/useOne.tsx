import { EqualityChecker, StoreApi } from "@davstack/store";

/**
 * React compiler compatible version of `StoreApi.use`.
 */
export function useOne<
  V,
  S extends (state: V) => unknown = (state: V) => V,
  R = S extends (state: V) => infer TReturnType ? TReturnType : V,
>(
  api: {
    use: (selector?: (t: V) => any, eq?: any) => any;
  },
  selector?: S,
  equalityFn?: EqualityChecker<R> | unknown,
): R {
  return api.use(selector, equalityFn);
}
