import { constant, filter, find, head, map } from "lodash";
import { useEffect, useMemo, useState } from "react";
import { createSlice } from "./createSlice";

export const defaultGuard = constant(true) as any;

export type Layer<T = Record<string, any>> = {
  key: string;
  name?: string;
  source?: { type: string } & T;
  transparency?: "25" | "50" | "75" | "100";
};

export type Layers = {
  layers: Layer[];
};

export const [useLayers, LayersProvider] = createSlice<Layers, Partial<Layers>>(
  {
    layers: [],
  }
);

export function useLayer<T extends Record<string, any> = Record<string, any>>(
  defaultKey?: string,
  guard: (l: Layer) => l is Layer<T> = defaultGuard
) {
  const [key, setKey] = useState(defaultKey);
  const [{ layers }, setLayers] = useLayers();
  const filtered = filter(layers, guard);
  const layer = (key ? find(filtered, { key }) : head(filtered)) as
    | Layer<T>
    | undefined;
  useEffect(() => {
    setKey(defaultKey);
  }, [defaultKey]);
  useEffect(() => {
    if (layer && layer.key !== key) {
      setKey(layer.key);
    }
  }, [layer, key, setKey]);
  return useMemo(
    () =>
      ({
        key: layer?.key,
        setKey,
        layer,
        setLayer: (newLayer: Layer<T>) => {
          const mergedLayer = { ...layer, ...newLayer };
          console.log(layer, newLayer, mergedLayer);
          setLayers(({ layers: prev }) => ({
            layers: map(prev, (l) =>
              l.key === mergedLayer.key ? mergedLayer : l
            ),
          }));
        },
        layers: filtered,
      } as const),
    [layer, setLayers, filtered]
  );
}
