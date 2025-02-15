import { LayerController } from "layers/LayerController";
import { Layer } from "slices/layers";
import { TraceLayerData } from "./TraceLayer";
import { FunctionComponent } from "react";
import { RendererProps } from "./renderer";

export type Controller = LayerController<"trace", TraceLayerData> & {
  renderer: FunctionComponent<
    Omit<RendererProps, "layer"> & { layer?: Layer<TraceLayerData> }
  >;
};
