import { d2InstrinsicComponents } from "./pixi/PixiPrimitives";

import { d2SearchFormats } from "./pixi/PixiSearchFormats";
import { TraceComponent } from "../types/trace";

export const primitiveComponents = {
  ...d2InstrinsicComponents
}

export type RendererSearchFormats = {
  [key: string]: { [key: string]: TraceComponent[] }
}

export const inbuiltSearchFormats = {
  ...d2SearchFormats
}