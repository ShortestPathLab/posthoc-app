import { PlaybackLayerData } from "components/app-bar/Playback";
import { HighlightLayerData } from "hooks/useHighlight";
import { getController } from "layers/layerControllers";
import { TraceLayerData } from "layers/trace/TraceLayer";
import { Layer } from "slices/layers";
import { TreeLayer } from "./TreeLayer";

export type TreeLayer = Layer<
  PlaybackLayerData & TraceLayerData & HighlightLayerData
>;
export const isTreeLayer = (l: Layer<unknown>): l is TreeLayer =>
  !!getController(l)?.steps;
