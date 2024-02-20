import { noop } from "lodash";
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useAsync, useGetSet } from "react-use";
import { Reducer, merge } from "./reducers";

type Slice<T, U = T> = [T, (next: (prev: T) => U) => void, boolean];

type Options<T, U> = {
  init?: () => Promise<U | undefined>;
  effect?: (state: { prev: T; next: T }) => void;
  reduce?: Reducer<T, U>;
};

export function createSlice<T, U = T>(
  initialState: T,
  { init, effect, reduce = merge }: Options<T, U> = {}
) {
  const Store = createContext<Slice<T, U>>([initialState, noop, false]);
  return [
    // Hook
    () => useContext(Store),
    // Context
    ({ children }: { children?: ReactNode }) => {
      const [initialised, setInitialised] = useState(false);
      const [get, set] = useGetSet(initialState);
      const reduceSlice = useCallback(
        (n: (prev: T) => U) => {
          const next = reduce(get(), n(get()));
          effect?.({ prev: get(), next });
          set(next);
        },
        [get]
      );
      const slice = useMemo<Slice<T, U>>(
        () => [get(), reduceSlice, initialised],
        [get(), reduceSlice, initialised]
      );
      useAsync(async () => {
        const r = await init?.();
        if (r) reduceSlice(() => r);
        setInitialised(true);
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
