import { MapLayer } from "layers/map";
import { Layer } from "slices/layers";

export const isMapLayer = (c: Layer<unknown>): c is MapLayer =>
  c.source?.type === "map";
