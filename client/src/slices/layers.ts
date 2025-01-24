import { constant, filter, find, head } from "lodash";
import { map } from "promise-tools";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createSlice } from "./createSlice";

export const defaultGuard = constant(true) as any;

export type Layer<T = Record<string, any>> = {
  key: string;
  name?: string;
  source?: { type: string } & T;
  transparency?: "25" | "50" | "75" | "100";
  displayMode?: GlobalCompositeOperation;
  viewKey?: string;
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
  const layer = (
    key ? find(filtered, { key }) ?? head(filtered) : head(filtered)
  ) as Layer<T> | undefined;
  useEffect(() => {
    setKey(defaultKey);
  }, [defaultKey]);
  useEffect(() => {
    if (layer && layer.key !== key) {
      setKey(layer.key);
    }
  }, [layer, key, setKey]);

  const setLayer = useCallback(
    async (
      newLayer:
        | Layer<T>
        | ((layer: Layer<T>) => Layer<T>)
        | ((layer: Layer<T>) => Promise<Layer<T>>)
    ) => {
      setLayers(async ({ layers: prev }) => {
        return {
          layers: await map(prev, async (l) =>
            l.key === layer?.key
              ? {
                  ...l,
                  ...(typeof newLayer === "function"
                    ? await newLayer(l as Layer<T>)
                    : newLayer),
                }
              : l
          ),
        };
      });
    },
    [setLayers, layer?.key]
  );

  return useMemo(
    () =>
      ({
        key: layer?.key,
        setKey,
        layer,
        setLayer,
        layers: filtered,
        allLayers: layers,
      } as const),
    [layers, layer, setLayer, filtered]
  );
}
