import { EditorSetterProps } from "components/Editor";
import { SelectionMenuContent } from "components/inspector/SelectionMenu";
import { SelectEvent } from "components/renderer/Renderer";
import { Dictionary } from "lodash";
import { TraceEvent } from "protocol";
import { createElement, FC, ReactNode } from "react";
import { Layer } from "slices/layers";
import { controller as mapController } from "./map";
import { controller as queryController } from "./query";
import { controller as traceController } from "./trace";

export type SelectionInfoProvider = FC<{
  layer?: string;
  event?: SelectEvent;
  children?: (menu: SelectionMenuContent) => ReactNode;
}>;

export type LayerController<K extends string, T> = {
  key: K;
  editor: FC<EditorSetterProps<Layer<T>>>;
  renderer: FC<{ layer?: Layer<T>; index?: number }>;
  service?: FC<EditorSetterProps<Layer<T>>>;
  inferName: (layer: Layer<T>) => string;
  steps: FC<{
    layer?: Layer<T>;
    children?: (steps: TraceEvent[]) => ReactNode;
  }>;
  getSelectionInfo?: SelectionInfoProvider;
};

export function RenderLayer({
  layer,
  index,
}: {
  layer?: Layer;
  index?: number;
}) {
  return (
    <>
      {layer &&
        createElement(layerHandlers[layer?.source?.type ?? ""]?.renderer, {
          layer,
          index,
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

export const layerHandlers: Dictionary<LayerController<string, any>> = {
  map: mapController,
  trace: traceController,
  query: queryController,
};
