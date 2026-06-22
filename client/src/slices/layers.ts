import { store } from "@davstack/store";
import { isEqual } from "es-toolkit";
import { filter, head, map } from "es-toolkit/compat";
import hash from "object-hash";
import { useEffect, useState } from "react";
import { createOne, createSelector } from "./selector";
import { useOne } from "./useOne";

export type Layer<T = Record<string, unknown>> = {
  key: string;
  name?: string;
  source?: { type: string } & T;
  transparency?: "25" | "50" | "75" | "100";
  displayMode?: GlobalCompositeOperation;
  viewKey?: string;
};

export type LayerGuard<T> = (l: Layer<Record<string, unknown> | unknown>) => l is Layer<T>;

export const defaultGuard = ((l) => !!l) as LayerGuard<never>;

export const layers = store<Layer[]>([], {
  name: "layers",
  devtools: { enabled: import.meta.env.DEV },
}).extend((store) => {
  return {
    one: createSelector(store),
  };
});

export const WithLayer = createOne(layers.one);
export function useLayers<T extends Record<string, unknown>>(guard: LayerGuard<T> = defaultGuard) {
  const all = useOne(layers, (c) => map(c, "key"), isEqual);
  const guarded = filter(all, (k) => {
    const l = layers.one(k).get();
    return l ? guard(l) : false;
  });
  return { all, guarded };
}

export function useLayerPicker<T extends Record<string, unknown>>(
  guard: LayerGuard<T> = defaultGuard,
) {
  const { all, guarded } = useLayers<T>(guard);

  const [key, setKey] = useState<string>();

  const guardedHash = hash(guarded);

  // Set key to a default layer
  useEffect(() => {
    if (guarded.length && (!key || !guarded.includes(key))) setKey(head(guarded));
    // `guarded` is read fresh; changes are tracked via `guardedHash`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, guardedHash]);

  // Reset key if layer was removed
  useEffect(() => {
    if (key && !guarded.includes(key)) setKey(undefined);
    // `guarded` is read fresh; changes are tracked via `guardedHash`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, guardedHash]);

  return { key, guarded, all, setKey };
}
