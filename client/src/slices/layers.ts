import { filter, find, head } from "lodash";
import { producify, producifyAsync } from "produce";
import { map } from "promise-tools";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createSlice } from "./createSlice";
import { getController } from "layers/layerControllers";

type LayerGuard<T> = (l: Layer<any>) => l is Layer<T>;

export const defaultGuard = ((l) => !!l) as LayerGuard<never>;

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

export function useLayer<T extends Record<string, any>>(
  defaultKey?: string,
  guard: LayerGuard<T> = defaultGuard
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

  const updateLayerAsync = useCallback(
    (s: (u: Layer<T>) => Promise<void>) => setLayer(producifyAsync(s)),
    [setLayer]
  );
  const updateLayer = useCallback(
    (s: (u: Layer<T>) => void) => setLayer(producify(s)),
    [setLayer]
  );

  return useMemo(
    () =>
      ({
        key: layer?.key,
        setKey,
        layer,
        setLayer,
        updateLayer,
        updateLayerAsync,
        layers: filtered,
        allLayers: layers,
        controller: getController(layer),
      } as const),
    [layers, layer, setLayer, filtered, updateLayer, updateLayerAsync]
  );
}
