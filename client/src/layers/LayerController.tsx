import { EditorSetterProps } from "components/Editor";
import { SelectionMenuContent } from "components/inspector/SelectionMenu";
import { SelectEvent } from "components/renderer/Renderer";
import { TraceEvent } from "protocol";
import { FC, ReactNode } from "react";
import { Layer } from "slices/layers";

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
  steps?: FC<{
    layer?: Layer<T>;
    children?: (steps: TraceEvent[]) => ReactNode;
  }>;
  getSelectionInfo?: SelectionInfoProvider;
};
