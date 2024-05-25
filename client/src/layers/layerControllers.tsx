import { Dictionary, once } from "lodash";
import { Layer } from "slices/layers";
import { LayerController } from "./LayerController";
import { controller as mapController } from "./map";
import { controller as traceController } from "./trace";
import { controller as queryController } from "./query";

export function getController(layer?: Layer) {
  return getControllers()[layer?.source?.type ?? ""];
}

export const getControllers: () => Dictionary<LayerController<string, any>> =
  once(() => ({
    trace: traceController,
    map: mapController,
    query: queryController,
  }));
