import { getController } from "layers/layerControllers";
import { map } from "lodash-es";
import { createElement, useMemo } from "react";
import { slice } from "slices";
import { useActive } from "./SyncService";
import { useOne } from "slices/useOne";

function useLayerServices() {
  const isActive = useActive();
  const layers = useOne(slice.layers);
  return useMemo(() => {
    return isActive
      ? map(layers, (layer) => {
          const { service } = getController(layer);
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
  }, [isActive, layers]);
}

export function LayerService() {
  const layerServices = useLayerServices();
  return <>{layerServices}</>;
}
