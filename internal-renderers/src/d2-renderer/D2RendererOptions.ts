import { Renderer, RendererEvents, RendererOptions } from "renderer";
import { CompiledD2IntrinsicComponent } from "./D2IntrinsicComponents";

export type Size = {
  width: number;
  height: number;
};

export type Point = {
  x: number;
  y: number;
};

type DynamicResolutionOptions = {
  intervalMs: number;
  increment: number;
  maxScale: number;
  minScale: number;
  dtMax: number;
  dtMin: number;
};

export type D2RendererOptions = RendererOptions & {
  tileResolution: Size;
  tileSubdivision: number;
  workerCount: number;
  workerIndex: number;
  refreshInterval: number;
  animationDuration: number;
  debounceInterval: number;
  dynamicResolution: DynamicResolutionOptions;
};

export const defaultD2RendererOptions: D2RendererOptions = {
  screenSize: { width: 256, height: 256 },
  workerCount: 4,
  workerIndex: 0,
  tileResolution: {
    width: 128,
    height: 128,
  },
  tileSubdivision: 0,
  refreshInterval: 1000 / 60,
  animationDuration: 150,
  debounceInterval: 75,
  backgroundColor: "#ffffff",
  accentColor: "#333333",
  dynamicResolution: {
    intervalMs: 5000,
    increment: 0.25,
    maxScale: 1.5,
    minScale: 1,
    dtMax: 1.5,
    dtMin: 1.1,
  },
};

export type D2RendererEvents = RendererEvents & {};

export type D2RendererInterface = Renderer<
  D2RendererOptions,
  D2RendererEvents,
  CompiledD2IntrinsicComponent
>;
