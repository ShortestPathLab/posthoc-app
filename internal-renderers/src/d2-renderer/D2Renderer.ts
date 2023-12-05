import {
  ceil,
  clamp,
  debounce,
  defer,
  find,
  floor,
  forEach,
  isEqual,
  isNaN,
  map,
  once,
  reduce,
  throttle,
  times,
  values,
} from "lodash";
import { nanoid } from "nanoid";
import { Viewport } from "pixi-viewport";
import * as PIXI from "pixi.js";
import { Bounds } from "protocol";
import { ComponentEntry, makeRenderer } from "renderer";
import { Bush } from "./Bush";
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
import { primitives } from "./primitives";

const { max, min } = Math;

class Tile extends PIXI.Sprite {
  static age: number = 0;
  age: number;
  destroying: boolean = false;
  constructor(texture?: PIXI.Texture, public bounds?: Bounds) {
    super(texture);
    this.age = Tile.age++;
  }
}

function handleNaN<T>(obj: T, def: T) {
  return isNaN(obj) ? def : obj;
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
  #system: Bush<CompiledD2IntrinsicComponent> = new Bush(16);
  #overlay?: PIXI.Graphics;

  #count: number = 0;

  #next() {
    return this.#count++;
  }

  getInstance() {
    return { app: this.#app, viewport: this.#viewport };
  }

  fitCamera() {
    const bounds = values(this.#system.all()).flat();
    if (bounds.length) {
      const out: Bounds = reduce(
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
      this.#viewport?.animate?.({
        position: new PIXI.Point(
          (out.left + out.right) / 2,
          (out.top + out.bottom) / 2
        ),
        scale:
          this.#viewport?.findFit?.(
            out.right - out.left,
            out.bottom - out.top
          ) * 0.8,
        ease: "easeOutExpo",
        time: this.#options.animationDuration * 1.5,
        callbackOnComplete: () => this.#getFrustumChangeQueue()(),
      });
    }
  }

  initialCamera() {
    this.#viewport?.animate?.({
      scale: 1,
      ease: "easeOutExpo",
      time: this.#options.animationDuration * 1.5,
      callbackOnComplete: () => this.#getFrustumChangeQueue()(),
    });
  }

  getView(): HTMLElement | undefined {
    return this.#app?.view;
  }

  setup(options: Partial<D2RendererOptions>) {
    const o = { ...defaultD2RendererOptions, ...options };
    this.#setupPixi(o);
    this.setOptions(o);
    this.#handleWorkerChange(o);
  }

  destroy(): void {
    map(this.#workers, (w) => w.terminate());
    this.#app!.destroy();
  }

  add(components: ComponentEntry<CompiledD2IntrinsicComponent>[]) {
    const id = nanoid();
    map(this.#workers, (w) => w.call("add", [components, id]));
    const bodies = map(components, ({ component, meta }) => ({
      ...primitives[component.$].test(component),
      component,
      meta,
      index: this.#next(),
    }));
    this.#system.load(bodies);
    return () =>
      defer(() => {
        for (const c of bodies) this.#system.remove(c);
        map(this.#workers, (w) => w.call("remove", [id]));
      });
  }

  setOptions(o: D2RendererOptions) {
    const options = { ...this.#options, ...o };
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
      autoDensity: true,
      resolution: 2,
    });

    this.#viewport = new Viewport({
      stopPropagation: true,
      screenWidth: options.screenSize.width,
      screenHeight: options.screenSize.height,
      events: this.#app.renderer.events,
      passiveWheel: false,
    });

    this.#viewport.on("clicked", (e) => {
      const { x, y } = e.world;
      const bodies = this.#system.search({
        minX: x,
        minY: y,
        maxX: x + Number.MIN_VALUE,
        maxY: y + Number.MIN_VALUE,
      });
      this.emit("click", e.event, {
        world: e.world,
        components: bodies,
      });
    });

    this.#app.stage.addChild(this.#viewport);

    this.#viewport
      .drag()
      .pinch()
      .wheel()
      .decelerate({ friction: 0.98 })
      .clampZoom({ maxScale: 300, minScale: 0.00001 });

    this.#viewport.on("moved", () => {
      this.#getFrustumChangeQueue()();
      this.#getUpdateGridQueue()();
    });

    this.#viewport.on("mousemove", (e) => this.#getUpdateOverlayQueue()(e));

    this.#world = new PIXI.Container();
    this.#viewport.addChild(this.#world);

    this.#grid = new PIXI.Graphics();
    this.#viewport.addChild(this.#grid);

    this.#overlay = new PIXI.Graphics();
    this.#viewport.addChild(this.#overlay);

    this.#startDynamicResolution();
  }

  #getFrustumChangeQueue = once(() =>
    debounce(() => this.#handleFrustumChange(), this.#options.debounceInterval)
  );

  #getUpdateGridQueue = once(() =>
    throttle(() => this.#updateGrid(), this.#options.refreshInterval)
  );
  #getUpdateOverlayQueue = once(() =>
    throttle(
      (e: PIXI.FederatedPointerEvent) => this.#updateHover(e),
      this.#options.refreshInterval
    )
  );

  #startDynamicResolution() {
    const { dynamicResolution } = this.#options;
    const { dtMax, dtMin, increment, intervalMs, maxScale, minScale } =
      dynamicResolution;
    const targetFrames = floor(PIXI.Ticker.targetFPMS * intervalMs);
    let frames = 0;
    let cdt = 0;
    let scale = 1;
    this.#app!.ticker.add((dt) => {
      const { tileResolution } = this.#options;
      if (!(frames % targetFrames)) {
        const adt = cdt / targetFrames;
        scale = clamp(
          adt >= dtMax
            ? scale + increment
            : adt <= dtMin
            ? scale - increment
            : scale,
          minScale,
          maxScale
        );
        map(this.#workers, (w) => {
          w.call("setTileResolution", [
            {
              width: ceil(tileResolution.width / scale),
              height: ceil(tileResolution.height / scale),
            },
          ]);
        });
        cdt = 0;
      }
      cdt += dt;
      frames++;
    });
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
    const texture = PIXI.Texture.from(bitmap);
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
    const { tiles } = getTiles(this.#viewport!, tileSubdivision);
    const px = this.#getPx();
    this.#grid?.clear();
    this.#grid?.lineStyle(1 * px, accentColor, 0.5);
    this.#grid?.beginFill(accentColor, 0.05);
    for (const { bounds: b, tile: t } of tiles) {
      if (!find(this.#world?.children, (c) => isEqual(c.bounds, b))) {
        this.#grid?.drawRect(b.left, b.top, b.right - b.left, b.bottom - b.top);
      }
    }
  }

  #updateHover(e: PIXI.FederatedPointerEvent) {
    const { accentColor } = this.#options;
    const px = this.#getPx();
    const { x, y } = this.#viewport!.toWorld(e.globalX, e.globalY);
    const bodies = this.#system.search({
      minX: x,
      minY: y,
      maxX: x + Number.MIN_VALUE,
      maxY: y + Number.MIN_VALUE,
    });
    this.#overlay!.clear();
    this.#overlay!.lineStyle(2 * px, accentColor, 1);
    for (const b of bodies) {
      this.#overlay?.drawRect(
        b.left,
        b.top,
        b.right - b.left,
        b.bottom - b.top
      );
    }
  }

  #getPx() {
    const { right, left } = this.#viewport!;
    const { width } = this.#options.screenSize;
    return (right - left) / width;
  }

  async #addToWorld(texture: PIXI.Texture, bounds: Bounds) {
    const { tileSubdivision } = this.#options;
    const { tiles } = getTiles(this.#viewport!, tileSubdivision);
    if (find(tiles, (t) => isEqual(t.bounds, bounds))) {
      const scale = {
        x: (bounds.right - bounds.left) / texture.width,
        y: (bounds.bottom - bounds.top) / texture.height,
      };
      const tile = new Tile(texture, bounds);
      this.#world
        ?.addChild(tile)
        .setTransform(bounds.left, bounds.top, scale.x, scale.y);
      this.#getUpdateGridQueue()();
      await this.#show(tile);
      forEach(this.#world?.children, async (c) => {
        if (intersect(c.bounds!, bounds) && c.age < tile.age) {
          if (!c.destroying) {
            c.destroying = true;
            await this.#hide(c);
            if (!c.destroyed) {
              c.destroy({ texture: true, baseTexture: true });
            }
          }
        }
      });
    }
  }

  #show(tile: Tile) {
    const ticker = this.#app!.ticker;
    return new Promise<void>((res) => {
      const f = (dt: number) => {
        tile.alpha +=
          dt / PIXI.Ticker.targetFPMS / this.#options.animationDuration;
        if (tile.alpha > 1) {
          ticker.remove(f);
          res();
        }
      };
      tile.alpha = 0;
      ticker.add(f);
    });
  }

  #hide(tile: Tile) {
    const ticker = this.#app!.ticker;
    return new Promise<void>((res) => {
      const f = (dt: number) => {
        tile.alpha -=
          dt / PIXI.Ticker.targetFPMS / this.#options.animationDuration;
        if (tile.alpha < 0) {
          ticker.remove(f);
          res();
        }
      };
      tile.alpha = 1;
      ticker.add(f);
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
