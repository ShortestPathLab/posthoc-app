import {
  CompiledComponent,
  ParsedComponent,
  Point,
  Size,
  TraceComponents,
} from "protocol";
import { FeatureDescriptor } from "protocol/FeatureQuery";
import EventEmitter from "typed-emitter";

export type RendererOptions = {
  definitions: TraceComponents;
  screenSize: Size;
};

export type RendererEvent = {};

export type RendererEvents = {
  click: (e: MouseEvent, rendererEvent: RendererEvent) => void;
};

export type RemoveElementCallback = () => void;

/**
 * Responsible for consuming the components definition
 * and steps in the search trace format and drawing them to the canvas.
 */
export interface Renderer<
  T extends RendererOptions,
  U extends RendererEvents,
  V extends CompiledComponent<any, any>
> extends EventEmitter<U> {
  setup(options: Partial<T>): void;
  destroy(): void;
  setOptions(options: Partial<T>): void;
  add(components: V[]): RemoveElementCallback;
  getView(): HTMLElement | undefined;
}

type RendererMetadata = FeatureDescriptor & {
  components: string[];
};

export function makeRenderer<
  T extends RendererOptions,
  U extends RendererEvents,
  V extends CompiledComponent<any, any>
>(Renderer: new () => Renderer<T, U, V>, options: RendererMetadata) {
  return { Renderer: Renderer, meta: options };
}
