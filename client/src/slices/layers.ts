import { store } from "@davstack/store";
import { filter, head, isEqual, map } from "lodash-es";
import hash from "object-hash";
import { useEffect, useState } from "react";
import { createOne, createSelector } from "./selector";

export type Layer<T = Record<string, unknown>> = {
  key: string;
  name?: string;
  source?: { type: string } & T;
  transparency?: "25" | "50" | "75" | "100";
  displayMode?: GlobalCompositeOperation;
  viewKey?: string;
};

export type LayerGuard<T> = (
  l: Layer<Record<string, unknown> | unknown>,
) => l is Layer<T>;

export const defaultGuard = ((l) => !!l) as LayerGuard<never>;

export const layers = store<Layer[]>([], {
  name: "layers",
  devtools: { enabled: false },
}).extend((store) => {
  return {
    one: createSelector(store),
  };
});

export const WithLayer = createOne(layers.one);
export function useLayers<T extends Record<string, unknown>>(
  guard: LayerGuard<T> = defaultGuard,
) {
  "use no memo";
  const all = layers.use((c) => map(c, "key"), isEqual);
  const guarded = filter(all, (k) => {
    const l = layers.one(k).get();
    return l ? guard(l) : false;
  });
  return { all, guarded };
}

export function useLayerPicker<T extends Record<string, unknown>>(
  guard: LayerGuard<T> = defaultGuard,
) {
  "use no memo";
  const { all, guarded } = useLayers<T>(guard);

  const [key, setKey] = useState<string>();

  // Set key to a default layer
  useEffect(() => {
    if (guarded.length && (!key || !guarded.includes(key)))
      setKey(head(guarded));
  }, [key, hash(guarded)]);

  // Reset key if layer was removed
  useEffect(() => {
    if (key && !guarded.includes(key)) setKey(undefined);
  }, [key, hash(guarded)]);

  return { key, guarded, all, setKey };
}
