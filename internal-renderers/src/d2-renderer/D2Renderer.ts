import { debounce, find, isEqual, map, once, throttle, times } from "lodash";
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
import { D2WorkerEvent, getTiles } from "./D2RendererWorker";
import { D2RendererWorkerAdapter } from "./D2RendererWorkerAdapter";
import { EventEmitter } from "./EventEmitter";
import { intersect } from "./intersect";

const { max } = Math;

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
  #grid?: PIXI.Graphics;
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
    this.#app!.destroy();
  }

  add(components: CompiledD2IntrinsicComponent[]) {
    const id = nanoid();
    map(this.#workers, (w) => w.call("add", [components, id]));
    return () => map(this.#workers, (w) => w.call("remove", [id]));
  }

  setOptions(options: D2RendererOptions) {
    this.#handleWorkerChange(options);
    this.#handleWindowSizeChange(options);
    this.#options = options;
    this.#handleFrustumChange();
    this.#updateGrid();
  }

  #setupPixi(options: D2RendererOptions) {
    this.#app = new PIXI.Application({
      backgroundAlpha: 0,
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

    this.#viewport.on("moved", () => {
      this.#getFrustumChangeQueue()();
      this.#getUpdateGridQueue()();
    });

    this.#world = new PIXI.Container();
    this.#viewport.addChild(this.#world);

    this.#grid = new PIXI.Graphics();
    this.#viewport.addChild(this.#grid);
  }

  #getFrustumChangeQueue = once(() =>
    debounce(() => this.#handleFrustumChange(), this.#options.debounceInterval)
  );

  #getUpdateGridQueue = once(() =>
    debounce(() => this.#updateGrid(), this.#options.refreshInterval)
  );

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

  #updateGrid() {
    const { tileSubdivision, accentColor } = this.#options;
    const { zoom, tiles } = getTiles(this.#viewport!, tileSubdivision);
    const px = this.#getPx();
    this.#grid?.clear();
    this.#grid?.removeChildren();
    this.#grid?.lineStyle(1 * px, accentColor, 0.5);
    this.#grid?.beginFill(accentColor, 0.05);
    for (const { bounds: b, tile: t } of tiles) {
      if (!find(this.#world?.children, (c) => isEqual(c.bounds, b))) {
        this.#grid?.drawRect(b.left, b.top, b.right - b.left, b.bottom - b.top);
        const text = new PIXI.Text(
          `LOD ${zoom} / X=${t.x} Y=${t.y} / L=${b.left} T=${b.top} R=${b.right} B=${b.bottom}`,
          {
            fontFamily: "Inter",
            fontSize: 12 * px,
            fill: accentColor,
          }
        );
        text.resolution = devicePixelRatio / px;
        this.#grid
          ?.addChild(text)
          .setTransform(b.left + 12 * px, b.top + 12 * px);
      }
    }
  }

  #getPx() {
    const { right, left } = this.#viewport!;
    const { width } = this.#options.screenSize;
    return (right - left) / width;
  }

  async #addToWorld(texture: PIXI.Texture, bounds: Bounds) {
    const { tileResolution: resolution, tileSubdivision } = this.#options;
    const { tiles } = getTiles(this.#viewport!, tileSubdivision);
    if (find(tiles, (t) => isEqual(t.bounds, bounds))) {
      const scale = {
        x: (bounds.right - bounds.left) / resolution.width,
        y: (bounds.bottom - bounds.top) / resolution.height,
      };
      const tile = new Tile(texture, bounds);
      this.#world
        ?.addChild(tile)
        .setTransform(bounds.left, bounds.top, scale.x, scale.y);
      this.#getUpdateGridQueue()();
      await this.#animate(tile);
      for (const c of this.#world!.children) {
        if (intersect(c.bounds!, bounds) && c !== tile) {
          c.destroy({ texture: true, baseTexture: true });
        }
      }
    }
  }

  #animate(tile: Tile) {
    return new Promise<void>((res) => {
      const f = () => {
        if (tile.alpha < 1) {
          tile.alpha += 1000 / 60 / this.#options.animationDuration;
          requestAnimationFrame(f);
        } else res();
      };
      tile.alpha = 0;
      requestAnimationFrame(f);
    });
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
