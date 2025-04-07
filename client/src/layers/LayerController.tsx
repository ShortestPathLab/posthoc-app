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

export type LayerSource = Feature & {
  language?: string;
  readonly?: boolean;
};

export type Steps = {
  key?: string;
  steps: TraceEvent[];
};

export type LayerController<K extends string = string, Data = never> = {
  key: K;
  icon: ReactElement;
  editor: FC<EditorSetterProps<Layer<Data>>>;
  renderer: FC<{ layer?: Layer<Data>; index?: number }>;
  service?: FC<EditorSetterProps<Layer<Data>>>;
  inferName: (layer: Layer<Data>) => string;
  steps?: (layer?: Layer<Data>) => Steps;
  error?: (layer?: Layer<Data>) => string | boolean | undefined;
  provideSelectionInfo?: SelectionInfoProvider;
  claimImportedFile?: (file: File) => Promise<
    | {
        claimed: true;
        layer: (notify: (s: string) => void) => Promise<Data>;
      }
    | { claimed: false }
  >;
  getSources?: (layer?: Layer<Data>) => LayerSource[];
  compress?: (data?: Data) => any;
  onEditSource?: (
    layer: Layer<Data>,
    id?: string,
    content?: string
  ) => Promise<void>;
};
