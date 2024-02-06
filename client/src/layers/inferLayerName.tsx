import { Layer } from "slices/layers";
import { layerHandlers } from "./layerHandlers";

export function inferLayerName(layer?: Layer) {
  if (layer?.name) {
    return layer?.name;
  } else if (layer?.source?.type) {
    const handler = layerHandlers[layer.source?.type];
    return handler.inferName(layer);
  } else return "Untitled Layer";
}
