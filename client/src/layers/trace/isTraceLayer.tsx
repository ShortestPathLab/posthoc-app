import { Layer } from "slices/layers";
import { TraceLayerData } from "./TraceLayer";

export const isTraceLayer = (
  layer: Layer<unknown>
): layer is Layer<TraceLayerData> => layer.source?.type === "trace";

export const isModernTraceLayer = (
  layer: Layer<unknown>
): layer is Layer<TraceLayerData> =>
  isTraceLayer(layer) && layer.source?.trace?.content?.version === "1.4.0";
