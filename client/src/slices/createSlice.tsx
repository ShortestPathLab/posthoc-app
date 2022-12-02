import { noop } from "lodash";
import {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useReducer,
} from "react";
import { useAsync } from "react-use";
import { Reducer, merge } from "./reducers";

type Slice<T, U = T> = [T, (next: U) => void];

type Options<T, U> = {
  /**
   * Async function that immediately gets invoked upon slice creation,
   * sets the value of the slice to the return value of this.
   */
  init?: () => Promise<U | undefined>;
  /**
   * Invoke this function whenever the value changes.
   */
  effect?: (state: { prev: T; next: T }) => void;
  /**
   * How the old value should be updated by the payload to obtain the new version.
   */
  reduce?: Reducer<T, U>;
};

export function createSlice<T, U = T>(
  /**
   * The initial values the properties of this slice should be set to.
   */
  initialState: T,
  { init, effect, reduce = merge }: Options<T, U> = {}
) {
  const Store = createContext<Slice<T, U>>([initialState, noop]);
  return [
    // Hook
    () => useContext(Store),
    // Context
    ({ children }: { children?: ReactNode }) => {
      const [value, set] = useReducer((p: T, n: U) => {
        const next = reduce(p, n);
        effect?.({ prev: p, next });
        return next;
      }, initialState);
      const slice = useMemo<Slice<T, U>>(() => [value, set], [value, set]);
      useAsync(async () => {
        const r = await init?.();
        if (r) set(r);
      });
      return <Store.Provider value={slice}>{children}</Store.Provider>;
    },
  ] as const;
}

export function withLocalStorage<T>(key: string) {
  return {
    init: () => {
      const cache = localStorage.getItem(key);
      if (cache) return JSON.parse(cache);
    },
    effect: ({ next }) => localStorage.setItem(key, JSON.stringify(next)),
  } as Options<T, T>;
}
