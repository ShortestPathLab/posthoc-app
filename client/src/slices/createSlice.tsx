import { noop } from "lodash";
import { useAsync } from "react-use";
import { merge, Reducer } from "./reducers";
import {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useReducer,
} from "react";



type Slice<T, U = T> = [T, (next: U) => void];

type Options<T, U> = {
  init?: () => Promise<U | undefined>;
  effect?: (state: { prev: T; next: T }) => void;
  reduce?: Reducer<T, U>;
};

export function createSlice<T, U = T>(
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

export function withLocalStorage<T>(key: string, def: T) {
  return {
    init: () => {
      const cache = localStorage.getItem(key);
      if (cache) {
        return JSON.parse(cache);
      } else return def;
    },
    effect: ({ next }) => localStorage.setItem(key, JSON.stringify(next)),
  } as Options<T, T>;
}