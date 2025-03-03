import { noop } from "lodash-es";
import { nanoid } from "nanoid";
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

type Slice<T, U = T> = [
  T,
  (
    next: ((prev: T) => U) | ((prev: T) => Promise<U>),
    /**
     * Whether to increment the current commit id.
     */
    dontCommit?: boolean
  ) => void,
  /**
   * Whether the slice has been initialised.
   */
  boolean,
  /**
   * The current commit id.
   */
  string,
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
        (n: ((prev: T) => U) | ((prev: T) => Promise<U>), c?: boolean) => {
          const x = n(get());
          if (x instanceof Promise) {
            // TODO: Could have a race condition issue where the
            // current value of the slice has changed when the promise resolves
            x.then((x) => reduceSlice(() => x, c));
          } else {
            const next = reduce(get(), x);
            effect?.({ prev: get(), next });
            if (!c) reduceCommit?.();
            set(next);
          }
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
