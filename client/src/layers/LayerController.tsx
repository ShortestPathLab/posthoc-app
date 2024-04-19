import { EditorSetterProps } from "components/Editor";
import { SelectionMenuContent } from "components/inspector/SelectionMenu";
import { SelectEvent } from "components/renderer/Renderer";
import { TraceEvent } from "protocol";
import { Feature } from "protocol/FeatureQuery";
import { FC, ReactElement, ReactNode } from "react";
import { Layer } from "slices/layers";

export type SelectionInfoProvider = FC<{
  layer?: string;
  event?: SelectEvent;
  children?: (menu: SelectionMenuContent) => ReactNode;
}>;

export type LayerController<K extends string, T> = {
  key: K;
  icon: ReactElement;
  editor: FC<EditorSetterProps<Layer<T>>>;
  renderer: FC<{ layer?: Layer<T>; index?: number }>;
  service?: FC<EditorSetterProps<Layer<T>>>;
  inferName: (layer: Layer<T>) => string;
  steps?: (layer?: Layer<T>) => TraceEvent[];
  error?: (layer?: Layer<T>) => string | boolean | undefined;
  provideSelectionInfo?: SelectionInfoProvider;
  claimImportedFile?: (file: File) => Promise<
    | {
        claimed: true;
        layer: (notify: (s: string) => void) => Promise<T>;
      }
    | { claimed: false }
  >;
  getSources?: (layer?: Layer<T>) => (Feature & { language?: string })[];
};
