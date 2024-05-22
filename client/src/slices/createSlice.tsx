import { noop } from "lodash";
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  useState,
} from "react";
import { useAsync, useGetSet } from "react-use";
import { Reducer, merge } from "./reducers";
import { nanoid } from "nanoid";

type Slice<T, U = T> = [
  T,
  (next: (prev: T) => U, dontCommit?: boolean) => void,
  boolean,
  string
];

type Options<T, U> = {
  init?: () => Promise<U | undefined>;
  effect?: (state: { prev: T; next: T }) => void;
  reduce?: Reducer<T, U>;
};

export function createSlice<T, U = T>(
  initialState: T,
  { init, effect, reduce = merge }: Options<T, U> = {}
) {
  const Store = createContext<Slice<T, U>>([
    initialState,
    noop,
    false,
    nanoid(),
  ]);
  return [
    // Hook
    () => useContext(Store),
    // Context
    ({ children }: { children?: ReactNode }) => {
      const [initialised, setInitialised] = useState(false);
      const [get, set] = useGetSet(initialState);
      const [commit, reduceCommit] = useReducer(() => nanoid(), nanoid());
      const reduceSlice = useCallback(
        (n: (prev: T) => U, c?: boolean) => {
          // console.log(n);
          const next = reduce(get(), n(get()));
          effect?.({ prev: get(), next });
          if (!c) reduceCommit?.();
          set(next);
        },
        [get, reduceCommit]
      );
      const slice = useMemo<Slice<T, U>>(
        () => [get(), reduceSlice, initialised, commit],
        [get(), reduceSlice, initialised, commit]
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
