import { Layer } from "slices/layers";
import { TraceLayerData } from ".";

export const isTraceLayer = (layer: Layer): layer is Layer<TraceLayerData> =>
  layer.source?.type === "trace";
