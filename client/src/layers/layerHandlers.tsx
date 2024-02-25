import { Dictionary } from "lodash";
import { Layer } from "slices/layers";
import { LayerController } from "./LayerController";
import { controller as mapController } from "./map";
import { controller as traceController } from "./trace";
import { controller as queryController } from "./query";

export function getLayerHandler(layer?: Layer) {
  return layerHandlers[layer?.source?.type ?? ""];
}

export const layerHandlers: Dictionary<LayerController<string, any>> = {
  trace: traceController,
  map: mapController,
  query: queryController,
};
