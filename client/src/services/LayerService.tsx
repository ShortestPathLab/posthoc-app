import { getLayerHandler } from "components/layer-editor/layers/LayerSource";
import { map } from "lodash";
import { createElement, useMemo } from "react";
import { useUIState } from "slices/UIState";

function useLayerServices() {
  const [{ layers }, setUIState] = useUIState();
  return useMemo(() => {
    return map(layers, (layer) => {
      const service = getLayerHandler(layer).service;
      if (service) {
        return createElement(service, {
          key: layer.key,
          value: layer,
          onChange: (v) =>
            setUIState({
              layers: map(layers, (l) => (l.key === layer.key ? v : l)),
            }),
        });
      }
    });
  }, [layers, setUIState]);
}
export function LayerService() {
  const layerServices = useLayerServices();
  return <>{layerServices}</>;
}
