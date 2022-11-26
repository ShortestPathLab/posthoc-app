import {
  MouseEvent,
  Renderer,
  RendererEvent,
  RendererOptions,
  RendererState,
} from "protocol";

export class D2Renderer implements Renderer {
  initialise(options: RendererOptions): void {
    options;
  }
  destroy(): void {
    throw new Error("Method not implemented.");
  }
  onStateChange(state: RendererState): void {
    throw new Error("Method not implemented.");
  }
  on<K extends "click">(
    event: K,
    p: (...e: { click: [MouseEvent, RendererEvent] }[K]) => void
  ): () => void {
    throw new Error("Method not implemented.");
  }
}
