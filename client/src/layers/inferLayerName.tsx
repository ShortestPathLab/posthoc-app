import { Layer } from "slices/layers";
import { getController } from "./layerControllers";

export function inferLayerName(layer?: Layer<unknown>) {
  if (layer?.name) {
    return layer?.name;
  } else if (layer?.source?.type) {
    const handler = getController(layer);
    return handler.inferName(layer);
  } else return "Untitled Layer";
}
