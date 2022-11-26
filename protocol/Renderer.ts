import { Trace } from "./Trace";

interface EventEmitter<T extends { [K in string]: any[] } = any> {
  on<K extends keyof T>(event: K, p: (...e: T[K]) => void): () => void;
}

export type UIState = {
  step?: number;
};

export type RendererState = {
  specimen?: Trace<any>;
  UI?: UIState;
  map?: string;
};

export type RendererOptions = {
  state: RendererState;
  root: any;
};

export type MouseEvent = {
  x?: number;
  y?: number;
};

export type RendererEvent = {
  target?: any;
};

export interface Renderer
  extends EventEmitter<{ click: [MouseEvent, RendererEvent] }> {
  initialise(options: RendererOptions): void;
  destroy(): void;
  onStateChange(state: RendererState): void;
}
