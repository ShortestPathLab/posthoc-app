import { map, throttle, times } from "lodash";
import { nanoid } from "nanoid";
import { Viewport } from "pixi-viewport";
import * as PIXI from "pixi.js";
import { Bounds } from "protocol";
import { makeRenderer } from "renderer";
import { CompiledD2IntrinsicComponent } from "./D2IntrinsicComponents";
import {
  D2RendererEvents,
  D2RendererInterface,
  D2RendererOptions,
  defaultD2RendererOptions,
} from "./D2RendererOptions";
import { D2WorkerEvent } from "./D2RendererWorker";
import { D2RendererWorkerAdapter } from "./D2RendererWorkerAdapter";
import { EventEmitter } from "./EventEmitter";
import { intersect } from "./intersect";

class Tile extends PIXI.Sprite {
  constructor(texture?: PIXI.Texture, public bounds?: Bounds) {
    super(texture);
  }
}

class D2Renderer
  extends EventEmitter<D2RendererEvents>
  implements D2RendererInterface
{
  #app?: PIXI.Application<HTMLCanvasElement>;
  #viewport?: Viewport;
  #world?: PIXI.Container<Tile>;
  #options: D2RendererOptions = defaultD2RendererOptions;
  #workers: D2RendererWorkerAdapter[] = [];

  getView(): HTMLElement | undefined {
    return this.#app?.view;
  }

  setup(options: Partial<D2RendererOptions>) {
    const o = { ...defaultD2RendererOptions, ...options };
    // create a pixi application
    this.#setupPixi(o);
    this.setOptions(o);
  }

  destroy(): void {
    map(this.#workers, (w) => w.terminate());
  }

  add(components: CompiledD2IntrinsicComponent[]) {
    const id = nanoid();
    map(this.#workers, (w) => w.call("add", [components, id]));
    return () => map(this.#workers, (w) => w.call("remove", [id]));
  }

  setOptions(options: D2RendererOptions) {
    this.#handleWorkerChange(options);
    this.#handleWindowSizeChange(options);
    this.#handleFrustumChange();
    this.#options = options;
  }

  #setupPixi(options: D2RendererOptions) {
    this.#app = new PIXI.Application({
      background: "#ffffff",
      width: options.screenSize.width,
      height: options.screenSize.height,
    });

    this.#viewport = new Viewport({
      stopPropagation: true,
      screenWidth: options.screenSize.width,
      screenHeight: options.screenSize.height,
      events: this.#app.renderer.events,
      passiveWheel: false,
    });

    this.#app.stage.addChild(this.#viewport);

    this.#viewport
      .drag()
      .pinch()
      .wheel()
      .decelerate({ friction: 0.98 })
      .clampZoom({ maxScale: 300, minScale: 0.01 });

    this.#viewport.on(
      "moved",
      throttle(() => this.#handleFrustumChange(), options.refreshInterval, {
        leading: false,
        trailing: true,
      })
    );

    this.#world = new PIXI.Container();
    this.#viewport.addChild(this.#world);
  }

  #handleWorkerChange(options: D2RendererOptions) {
    map(this.#workers, (w) => w.terminate());
    this.#workers = times(options.workerCount, (i) => {
      const worker = new D2RendererWorkerAdapter();
      worker.on("update", (e) => this.#handleUpdate(e));
      worker.onerror = (e) => {
        throw e;
      };
      worker.call("setup", [{ ...options, workerIndex: i }]);
      return worker;
    });
  }

  #handleWindowSizeChange(options: D2RendererOptions) {
    const { width, height } = options.screenSize;
    this.#app?.renderer?.resize?.(width, height);
    this.#viewport?.resize(width, height);
  }

  #handleUpdate({ bounds, bitmap }: D2WorkerEvent<"update">["payload"]) {
    const texture = PIXI.Texture.from(bitmap, {
      scaleMode: PIXI.SCALE_MODES.NEAREST,
    });
    this.#addToWorld(texture, bounds);
  }

  #handleFrustumChange() {
    const { top, bottom, left, right } = this.#viewport!;
    map(this.#workers, (w) =>
      w.call("setFrustum", [{ top, bottom, left, right }])
    );
  }

  #addToWorld(texture: PIXI.Texture, bounds: Bounds) {
    const { tileResolution: resolution } = this.#options;
    const scale = {
      x: (bounds.right - bounds.left) / resolution.width,
      y: (bounds.bottom - bounds.top) / resolution.height,
    };
    this.#cull(bounds);
    this.#world
      ?.addChild(new Tile(texture, bounds))
      .setTransform(bounds.left, bounds.top, scale.x, scale.y);
  }

  #cull(bounds: Bounds) {
    for (const c of this.#world!.children) {
      if (intersect(c.bounds!, bounds)) {
        c.destroy({ texture: true, baseTexture: true });
      }
    }
  }
}

export default makeRenderer(D2Renderer, {
  components: ["rect", "circle", "path", "polygon"],
  id: "d2-renderer",
  name: "Pixi",
  description: "Provides 2D Visualisation Support",
  version: "1.0.0",
});

// change options like color and schema
// query for a chunk
// add remove elements
