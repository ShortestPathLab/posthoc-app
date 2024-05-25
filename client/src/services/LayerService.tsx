import { getController } from "layers/layerControllers";
import { map } from "lodash";
import { createElement, useMemo } from "react";
import { useLayers } from "slices/layers";
import { useSyncStatus } from "./SyncService";

function useLayerServices() {
  const { isPrimary } = useSyncStatus();
  const [{ layers }, setLayers, , c1] = useLayers();
  return useMemo(() => {
    return !isPrimary
      ? []
      : map(layers, (layer) => {
          const service = getController(layer).service;
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
  }, [c1, setLayers, isPrimary]);
}

export function LayerService() {
  const layerServices = useLayerServices();
  return <>{layerServices}</>;
}
