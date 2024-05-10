import { getLayerHandler } from "layers/layerHandlers";
import { map } from "lodash";
import { createElement, useMemo } from "react";
import { useLayers } from "slices/layers";
import { useSyncStatus } from "./SyncService";

function useLayerServices() {
  const { isPrimary } = useSyncStatus();
  const [{ layers }, setLayers] = useLayers();
  return useMemo(() => {
    return !isPrimary
      ? []
      : map(layers, (layer) => {
          const service = getLayerHandler(layer).service;
          if (service) {
            return createElement(service, {
              key: layer.key,
              value: layer,
              onChange: (v) =>
                setLayers(({ layers: prev }) => ({
                  layers: map(prev, (l) => (l.key === layer.key ? v(l) : l)),
                })),
            });
          }
        });
  }, [layers, setLayers, isPrimary]);
}

export function LayerService() {
  const layerServices = useLayerServices();
  return <>{layerServices}</>;
}
