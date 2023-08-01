import { CompiledComponent, Size } from "protocol";
import { FeatureDescriptor } from "protocol/FeatureQuery";
import EventEmitter from "typed-emitter";

export type RendererOptions = {
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
  T extends RendererOptions = RendererOptions,
  U extends RendererEvents = RendererEvents,
  V extends CompiledComponent<any, any> = CompiledComponent<string, {}>
> extends EventEmitter<U> {
  setup(options: Partial<T>): void;
  destroy(): void;
  setOptions(options: Partial<T>): void;
  add(components: V[]): RemoveElementCallback;
  getView(): HTMLElement | undefined;
  fitCamera(): void;
  initialCamera(): void;
}

type RendererMetadata = FeatureDescriptor & {
  components: string[];
  version?: string;
};

export type RendererDefinition<
  T extends RendererOptions,
  U extends RendererEvents,
  V extends CompiledComponent<any, any>
> = {
  constructor: new () => Renderer<T, U, V>;
  meta: RendererMetadata;
};

export function makeRenderer<
  T extends RendererOptions,
  U extends RendererEvents,
  V extends CompiledComponent<any, any>
>(
  Renderer: new () => Renderer<T, U, V>,
  options: RendererMetadata
): RendererDefinition<T, U, V> {
  return { constructor: Renderer, meta: options };
}
