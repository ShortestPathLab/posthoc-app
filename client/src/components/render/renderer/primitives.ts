import { d2InstrinsicComponents } from "./pixi/PixiPrimitives";

import { d2InbuiltViews } from "./pixi/PixiInbuiltViews";
import { TraceComponents } from "protocol/Trace";

export const primitiveComponents = {
  ...d2InstrinsicComponents
}

export type RendererInbuiltViews = {
  [key: string]: {[key: string]:TraceComponents}
}

export const inbuiltViews = {
  ...d2InbuiltViews
}