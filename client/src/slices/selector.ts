import { EqualityChecker, StoreApi } from "@davstack/store";
import { find, findIndex, get, identity, isEqual, isFunction } from "lodash";
import { ReactNode } from "react";

type KeyOf<T> = keyof Exclude<T, undefined | null>;

export function equal<T, U = T>(
  key: KeyOf<T> | ((l: T) => U),
  comparator: (a: U, b: U) => boolean = (a, b) => a === b
) {
  const value = isFunction(key) ? key : (l: T) => get(l, key);
  return (a: T, b: T) => comparator(value(a), value(b));
}

export type SelectorApi<T> = {
  use: <R = T>(
    selector?: (t: T) => R,
    eq?: EqualityChecker<R | undefined>
  ) => R | undefined;
  set: (m: Setter<T>) => void;
  get: <O = T>(selector?: (l: T) => O) => O | undefined;
};

export type Selector<Item> = <T extends Item>(key?: string) => SelectorApi<T>;

export type Transaction<T> = (u: T) => T | void;

export type Setter<T> = Transaction<T> | T;

export const createSelector = <Item extends { key: string }>(
  store: StoreApi<Item[]>
) =>
  (<T extends Item>(key?: string) => ({
    use: function use<R = T>(
      selector: (t: T) => R = identity,
      eq: EqualityChecker<R | undefined> = isEqual
    ) {
      "use no memo";
      return store.use<(l: Item[]) => R | undefined>(
        (s) => {
          const item = find(s, { key });
          return item ? selector?.(item as T) : undefined;
        },
        // TODO: There is a type bug in the @davstack/store library
        eq as unknown as EqualityChecker<Item[]>
      );
    },
    set: (m: Setter<T>) =>
      store.set((s) => {
        const i = findIndex(s, (k) => k.key === key);
        if (i >= 0) {
          s[i] = typeof m === "function" ? m(s[i] as T) ?? s[i] : m;
        }
      }),
    get: <O = T>(selector: (l: T) => O = identity) =>
      store.get((s) => {
        const layer = find(s, { key });
        if (layer) return selector(layer as T);
      }),
  })) satisfies Selector<Item>;

type WithItemProps<S> = {
  layer?: string;
  children?: (layer: S) => ReactNode;
};

export const createOne = <S>(selector: (key?: string) => SelectorApi<S>) =>
  function WithItem<T extends S>({ children, layer: key }: WithItemProps<T>) {
    "use no memo";
    const l = selector(key).use();
    return l && children?.(l as T);
  };
