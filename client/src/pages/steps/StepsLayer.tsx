import { PlaybackLayerData } from "components/app-bar/Playback";
import { HighlightLayerData } from "hooks/useHighlight";
import { getController } from "layers/layerControllers";
import { Layer } from "slices/layers";

export const isStepsLayer = (l: Layer<unknown>): l is StepsLayer =>
  !!getController(l).steps;

export type StepsLayer = Layer<PlaybackLayerData & HighlightLayerData>;
