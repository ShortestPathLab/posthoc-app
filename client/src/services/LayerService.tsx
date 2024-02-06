import { getLayerHandler } from "layers/layerHandlers";
import { map } from "lodash";
import { createElement, useMemo } from "react";
import { useLayers } from "slices/layers";

function useLayerServices() {
  const [{ layers: layers }, setLayers] = useLayers();
  return useMemo(() => {
    return map(layers, (layer) => {
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
  }, [layers, setLayers]);
}

export function LayerService() {
  const layerServices = useLayerServices();
  return <>{layerServices}</>;
}
