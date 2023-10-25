import { EditorSetterProps } from "components/Editor";
import { SelectionMenuContent } from "components/inspector/SelectionMenu";
import { SelectEvent } from "components/renderer/Renderer";
import { Dictionary } from "lodash";
import { TraceEvent } from "protocol";
import { createElement, FC, ReactNode } from "react";
import { Layer } from "slices/layers";
import { mapLayerSource } from "./mapLayerSource";
import { queryLayerSource } from "./queryLayerSource";
import { traceLayerSource } from "./traceLayerSource";

export type SelectionInfoProvider = FC<{
  layer?: string;
  event?: SelectEvent;
  children?: (menu: SelectionMenuContent) => ReactNode;
}>;

export type LayerSource<K extends string, T> = {
  key: K;
  editor: FC<EditorSetterProps<Layer<T>>>;
  renderer: FC<{ layer?: Layer<T> }>;
  service?: FC<EditorSetterProps<Layer<T>>>;
  inferName: (layer: Layer<T>) => string;
  steps: FC<{
    layer?: Layer<T>;
    children?: (steps: TraceEvent[]) => ReactNode;
  }>;
  getSelectionInfo?: SelectionInfoProvider;
};

export function RenderLayer({ layer }: { layer?: Layer }) {
  return (
    <>
      {layer &&
        createElement(layerHandlers[layer?.source?.type ?? ""]?.renderer, {
          layer,
        })}
    </>
  );
}

export function inferLayerName(layer?: Layer) {
  if (layer?.name) {
    return layer?.name;
  } else if (layer?.source?.type) {
    const handler = layerHandlers[layer.source?.type];
    return handler.inferName(layer);
  } else return "Untitled Layer";
}

export function getLayerHandler(layer?: Layer) {
  return layerHandlers[layer?.source?.type ?? ""];
}

export const layerHandlers: Dictionary<LayerSource<string, any>> = {
  map: mapLayerSource,
  trace: traceLayerSource,
  query: queryLayerSource,
};
