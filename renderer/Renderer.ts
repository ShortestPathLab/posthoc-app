import { CompiledComponent, Point, Size, Bounds } from "protocol";
import { FeatureDescriptor } from "protocol/FeatureQuery";
import EventEmitter from "typed-emitter";

export type RendererOptions = {
  screenSize: Size;
  errorColor: string;
  backgroundColor: string;
  accentColor: string;
};

export type RendererEvent = {
  world: Point;
  components: ComponentEntry[];
};

export type RendererEvents = {
  click: (e: Event, rendererEvent: RendererEvent) => void;
};

export type RemoveElementCallback = () => void;

type Meta = {
  sourceLayer?: string;
  sourceLayerIndex?: number;
  sourceLayerDisplayMode?: GlobalCompositeOperation;
  sourceLayerAlpha?: number;
  step?: number;
  info?: any;
};

export type ComponentEntry<
  V extends CompiledComponent<any, any> = CompiledComponent<string, {}>,
  M = Meta
> = {
  component: V;
  meta?: M;
};

/**
 * Responsible for consuming the components definition
 * and steps in the search trace format and drawing them to the canvas.
 */
export interface Renderer<
  T extends RendererOptions = RendererOptions,
  U extends RendererEvents = RendererEvents,
  V extends CompiledComponent<any, any> = CompiledComponent<string, {}>,
  M = Meta
> extends EventEmitter<U> {
  setup(options: Partial<T>): void;
  destroy(): void;
  setOptions(options: Partial<T>): void;
  add(components: ComponentEntry<V>[]): RemoveElementCallback;
  getView(): HTMLElement | undefined;
  fitCamera(fn?: (body: Bounds & ComponentEntry<V, M>) => boolean): void;
  initialCamera(): void;
  getInstance(): any;
  toDataUrl(): Promise<string | undefined>;
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
