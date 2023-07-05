import { Renderer, RendererEvents, RendererOptions } from "renderer";
import {
  CompiledD2IntrinsicComponent,
  ParsedD2IntrinsicComponent,
} from "./D2IntrinsicComponents";

export type Size = {
  width: number;
  height: number;
};

export type Point = {
  x: number;
  y: number;
};

export type D2RendererOptions = RendererOptions & {
  tileResolution: Size;
  tileSubdivision: number;
  workerCount: number;
  workerIndex: number;
  refreshInterval: number;
  backgroundColor: string;
};

export const defaultD2RendererOptions: D2RendererOptions = {
  screenSize: { width: 256, height: 256 },
  definitions: {},
  workerCount: 4,
  workerIndex: 0,
  tileResolution: {
    width: 128,
    height: 128,
  },
  tileSubdivision: 0,
  refreshInterval: 1000 / 48,
  backgroundColor: "#ffffff",
};

export type D2RendererEvents = RendererEvents & {};

export type D2RendererInterface = Renderer<
  D2RendererOptions,
  D2RendererEvents,
  CompiledD2IntrinsicComponent
>;
