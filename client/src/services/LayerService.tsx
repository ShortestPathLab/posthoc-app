import { getController } from "layers/layerControllers";
import { map } from "lodash";
import { createElement, useMemo } from "react";
import { useSyncStatus } from "./SyncService";
import { slice } from "slices";

function useLayerServices() {
  "use no memo";
  const { isPrimary } = useSyncStatus();
  const layers = slice.layers.use();
  return useMemo(() => {
    return isPrimary
      ? map(layers, (layer) => {
          const service = getController(layer).service;
          if (service) {
            return createElement(service, {
              key: layer.key,
              value: layer,
              onChange: (v) => {
                slice.layers.one(layer.key).set(v);
              },
            });
          }
        })
      : [];
  }, [isPrimary, layers]);
}

export function LayerService() {
  const layerServices = useLayerServices();
  return <>{layerServices}</>;
}
