import {
  D2RendererEvents,
  D2RendererInterface,
  D2RendererOptions,
  defaultD2RendererOptions,
} from "../d2-renderer/D2RendererOptions";
import { Body, defaultBounds, isValue } from "../d2-renderer/D2RendererWorker";
import { EventEmitter } from "../d2-renderer/EventEmitter";
import { Viewport } from "pixi-viewport";
import { ComponentEntry, RemoveElementCallback } from "renderer";
import { Bush } from "../d2-renderer/Bush";
import { CompiledD2IntrinsicComponent } from "../d2-renderer/D2IntrinsicComponents";

import {
  constant,
  debounce,
  isNaN,
  once,
  pickBy,
  reduce,
  values,
} from "lodash";
import * as PIXI from "pixi.js";
import { primitives } from "../d2-renderer/primitives";

const { max, min } = Math;

function handleNaN<T>(obj: T, def: T) {
  return isNaN(obj) ? def : obj;
}

export class D2RendererBase
  extends EventEmitter<D2RendererEvents>
  implements D2RendererInterface
{
  protected app?: PIXI.Application<HTMLCanvasElement>;
  protected options: D2RendererOptions = defaultD2RendererOptions;
  protected system: Bush<CompiledD2IntrinsicComponent> = new Bush(16);
  protected viewport?: Viewport;
  protected overlay?: PIXI.Graphics;
  #count: number = 0;

  protected next() {
    return this.#count++;
  }

  setup(options: Partial<D2RendererOptions>): void {
    if (this.#featureError()) {
      throw new Error(this.#featureError());
    }
    const o = { ...defaultD2RendererOptions, ...options };
    this.setupPixi(o);
    this.setOptions(o);
  }
  protected setupPixi(options: D2RendererOptions) {
    this.app = new PIXI.Application({
      backgroundAlpha: 0,
      width: options.screenSize.width,
      height: options.screenSize.height,
      autoDensity: true,
      resolution: 2,
    });
    this.setupViewport(options);
    this.setupOverlay();
  }

  protected setupOverlay() {
    if (!this.viewport) return;
    this.overlay = new PIXI.Graphics();
    this.viewport.addChild(this.overlay);
  }

  protected setupViewport(options: D2RendererOptions) {
    if (!this.app) return;
    this.viewport = new Viewport({
      stopPropagation: true,
      screenWidth: options.screenSize.width,
      screenHeight: options.screenSize.height,
      events: this.app.renderer.events,
      passiveWheel: false,
    });
    this.viewport.on("clicked", (e) => {
      const { x, y } = e.world;
      const bodies = this.system
        .search({
          minX: x,
          minY: y,
          maxX: x + Number.MIN_VALUE,
          maxY: y + Number.MIN_VALUE,
        })
        .filter((c) => primitives[c.component.$].narrow(c.component, { x, y }));
      this.emit("click", e.event, {
        world: e.world,
        components: bodies,
      });
    });

    this.app.stage.addChild(this.viewport);

    this.viewport
      .drag()
      .pinch()
      .wheel()
      .decelerate({ friction: 0.98 })
      .clampZoom({ maxScale: 300, minScale: 0.00001 });

    this.viewport.on("moved", () => {
      this.getFrustumChangeQueue()();
    });
  }

  #featureError = once(() => {
    if (typeof OffscreenCanvas === "undefined") {
      return "OffscreenCanvas API is not supported by your system.";
    }
  });

  destroy(): void {
    this.app?.destroy?.();
  }
  protected handleWindowSizeChange(options: D2RendererOptions) {
    const { width, height } = options.screenSize;
    this.app?.renderer?.resize?.(width, height);
    this.viewport?.resize(width, height);
  }
  setOptions(o: Partial<D2RendererOptions>): void {
    const options = { ...this.options, ...o };
    this.handleWindowSizeChange(options);
    this.options = options;
    this.handleFrustumChange();
  }
  add(
    components: ComponentEntry<CompiledD2IntrinsicComponent>[]
  ): RemoveElementCallback {
    const bodies = this.makeBodies(components);
    this.system.load(bodies);
    return () => {
      for (const c of bodies) this.system.remove(c);
    };
  }

  protected getPx() {
    if (!this.viewport) return 1;
    const { right, left } = this.viewport;
    const { width } = this.options.screenSize;
    return (right - left) / width;
  }

  protected makeBodies(
    components: ComponentEntry<CompiledD2IntrinsicComponent>[]
  ) {
    return components.map(({ component, meta }) => ({
      ...defaultBounds,
      ...pickBy(primitives[component.$].test(component), isValue),
      component,
      meta,
      index: this.next(),
    }));
  }

  getView(): HTMLElement | undefined {
    return this.app?.view;
  }
  fitCamera(
    fn: (body: Body<CompiledD2IntrinsicComponent>) => boolean = constant(true)
  ) {
    const bounds = values(this.system.all()).flat().filter(fn);
    if (bounds.length) {
      const out = this.getBounds(bounds);

      this.viewport?.animate?.({
        position: new PIXI.Point(
          (out.left + out.right) / 2,
          (out.top + out.bottom) / 2
        ),
        scale:
          this.viewport?.findFit?.(out.right - out.left, out.bottom - out.top) *
          0.8,
        ease: "easeOutExpo",
        time: this.options.animationDuration * 1.5,
        callbackOnComplete: () => this.getFrustumChangeQueue()(),
      });
    }
  }
  protected getFrustumChangeQueue = once(() =>
    debounce(() => this.handleFrustumChange(), this.options.debounceInterval)
  );
  protected getBounds(bounds: Body<CompiledD2IntrinsicComponent>[]) {
    return reduce(
      bounds,
      (a, b) => ({
        top: handleNaN(min(a.top, b.top), a.top),
        left: handleNaN(min(a.left, b.left), a.left),
        bottom: handleNaN(max(a.bottom, b.bottom), a.bottom),
        right: handleNaN(max(a.right, b.right), a.right),
      }),
      {
        bottom: -Infinity,
        top: Infinity,
        left: Infinity,
        right: -Infinity,
      }
    );
  }

  protected handleFrustumChange() {}

  initialCamera() {
    this.viewport?.animate?.({
      scale: 1,
      ease: "easeOutExpo",
      time: this.options.animationDuration * 1.5,
      callbackOnComplete: () => this.getFrustumChangeQueue()(),
    });
  }
  getInstance() {
    return { app: this.app, viewport: this.viewport };
  }

  async toDataUrl(): Promise<string | undefined> {
    this.app?.render?.();
    return this.app?.view?.toDataURL?.();
  }
}
