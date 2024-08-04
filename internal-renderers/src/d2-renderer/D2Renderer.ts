import { D2RendererBase } from "../d2-renderer-base/D2RendererBase";
import {
  ceil,
  clamp,
  find,
  floor,
  forEach,
  isEqual,
  map,
  once,
  throttle,
  times,
} from "lodash";
import { nanoid } from "nanoid";
import { Viewport } from "pixi-viewport";
import * as PIXI from "pixi.js";
import { Bounds } from "protocol";
import { ComponentEntry, makeRenderer } from "renderer";
import { Bush } from "./Bush";
import { CompiledD2IntrinsicComponent } from "./D2IntrinsicComponents";
import {
  D2RendererOptions,
  defaultD2RendererOptions,
} from "./D2RendererOptions";
import { D2WorkerEvent, getTiles } from "./D2RendererWorker";
import { D2RendererWorkerAdapter } from "./D2RendererWorkerAdapter";
import { intersect } from "./intersect";
import { primitives } from "./primitives";

class Tile extends PIXI.Sprite {
  static age: number = 0;
  age: number;
  destroying: boolean = false;
  constructor(texture?: PIXI.Texture, public bounds?: Bounds) {
    super(texture);
    this.age = Tile.age++;
  }
}

export class D2Renderer extends D2RendererBase {
  protected app?: PIXI.Application<HTMLCanvasElement>;
  protected options: D2RendererOptions = defaultD2RendererOptions;
  protected system: Bush<CompiledD2IntrinsicComponent> = new Bush(16);
  protected viewport?: Viewport;
  protected overlay?: PIXI.Graphics;

  #tiles?: PIXI.Container<Tile>;
  #workers: D2RendererWorkerAdapter[] = [];
  #grid?: PIXI.Graphics;

  protected override setupPixi(o: D2RendererOptions) {
    super.setupPixi(o);
    if (!this.viewport) return;

    this.#tiles = new PIXI.Container();
    this.viewport.addChild(this.#tiles);

    this.#grid = new PIXI.Graphics();
    this.viewport.addChild(this.#grid);

    this.#startDynamicResolution();
  }
  setup(options: Partial<D2RendererOptions>) {
    super.setup(options);
    this.#handleWorkerChange(this.options);
  }

  destroy(): void {
    map(this.#workers, (w) => w.terminate());
    super.destroy();
  }

  add(components: ComponentEntry<CompiledD2IntrinsicComponent>[]) {
    const id = nanoid();
    const remove = super.add(components);
    this.#workers?.forEach?.((w) => w.call("add", [components, id]));
    return () => {
      requestIdleCallback(
        () => {
          remove();
          this.#workers?.forEach?.((w) => w.call("remove", [id]));
        },
        { timeout: this.options.animationDuration }
      );
    };
  }

  setOptions(o: D2RendererOptions) {
    super.setOptions(o);
    this.#updateGrid();
  }

  #getUpdateGridQueue = once(() =>
    throttle(() => this.#updateGrid(), this.options.refreshInterval)
  );
  #getUpdateOverlayQueue = once(() =>
    throttle(
      (e: PIXI.FederatedPointerEvent) => this.#updateHover(e),
      this.options.refreshInterval
    )
  );

  protected override setupViewport(options: D2RendererOptions) {
    super.setupViewport(options);
    if (!this.viewport) return;

    this.viewport.on("moved", () => {
      this.#getUpdateGridQueue()();
    });

    this.viewport.on("mousemove", (e) => this.#getUpdateOverlayQueue()(e));
  }

  #startDynamicResolution() {
    const { dynamicResolution } = this.options;
    const { dtMax, dtMin, increment, intervalMs, maxScale, minScale } =
      dynamicResolution;
    const targetFrames = floor(PIXI.Ticker.targetFPMS * intervalMs);
    let frames = 0;
    let cdt = 0;
    let scale = 1;
    this.app!.ticker.add((dt) => {
      const { tileResolution } = this.options;
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

  protected override handleWindowSizeChange(options: D2RendererOptions) {
    super.handleWindowSizeChange(options);
    map(this.#workers, (w) => {
      w.call("setTileResolution", [
        {
          width: ceil(options.tileResolution.width),
          height: ceil(options.tileResolution.height),
        },
      ]);
    });
  }

  #handleUpdate({ bounds, bitmap }: D2WorkerEvent<"update">["payload"]) {
    const texture = PIXI.Texture.from(bitmap);
    this.#addToWorld(texture, bounds);
  }

  protected override handleFrustumChange() {
    if (!this.viewport) return;
    const { top, bottom, left, right } = this.viewport;
    map(this.#workers, (w) =>
      w.call("setFrustum", [{ top, bottom, left, right }])
    );
  }

  #updateGrid() {
    if (!this.viewport) return;
    const { tileSubdivision, accentColor } = this.options;
    const { tiles } = getTiles(this.viewport, tileSubdivision);
    const px = this.getPx();
    this.#grid?.clear();
    this.#grid?.lineStyle(1 * px, accentColor, 0.5);
    this.#grid?.beginFill(accentColor, 0.05);
    for (const { bounds: b } of tiles) {
      if (!find(this.#tiles?.children, (c) => isEqual(c.bounds, b))) {
        this.#grid?.drawRect(b.left, b.top, b.right - b.left, b.bottom - b.top);
      }
    }
  }

  #updateHover(e: PIXI.FederatedPointerEvent) {
    const { accentColor } = this.options;
    const px = this.getPx();
    const { x, y } = this.viewport!.toWorld(e.globalX, e.globalY);
    const bodies = this.system
      .search({
        minX: x,
        minY: y,
        maxX: x + Number.MIN_VALUE,
        maxY: y + Number.MIN_VALUE,
      })
      .filter((c) => primitives[c.component.$].narrow(c.component, { x, y }));
    this.overlay!.clear();
    for (const b of bodies) {
      this.overlay!.lineStyle(
        2 * px,
        accentColor,
        "$info" in b.component ? 1 : 0.02
      );
      this.overlay?.drawRect(b.left, b.top, b.right - b.left, b.bottom - b.top);
    }
  }

  async #addToWorld(texture: PIXI.Texture, bounds: Bounds) {
    if (!this.viewport) return;
    const { tileSubdivision } = this.options;
    const { tiles } = getTiles(this.viewport, tileSubdivision);

    if (!find(tiles, (t) => isEqual(t.bounds, bounds))) return;

    const scale = {
      x: (bounds.right - bounds.left) / texture.width,
      y: (bounds.bottom - bounds.top) / texture.height,
    };
    const tile = new Tile(texture, bounds);
    this.#tiles
      ?.addChild(tile)
      .setTransform(bounds.left, bounds.top, scale.x, scale.y);
    this.#getUpdateGridQueue()();
    await this.#show(tile);
    forEach(this.#tiles?.children, async (c) => {
      if (!(intersect(c.bounds!, bounds) && c.age < tile.age && !c.destroying))
        return;
      c.destroying = true;
      await this.#hide(c);
      if (!c.destroyed) {
        c.destroy({ texture: true, baseTexture: true });
      }
    });
  }

  #show(tile: Tile) {
    const ticker = this.app!.ticker;
    return new Promise<void>((res) => {
      const f = (dt: number) => {
        tile.alpha +=
          dt / PIXI.Ticker.targetFPMS / this.options.animationDuration;
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
    const ticker = this.app!.ticker;
    return new Promise<void>((res) => {
      const f = (dt: number) => {
        tile.alpha -=
          dt / PIXI.Ticker.targetFPMS / this.options.animationDuration;
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
  name: "Pixel",
  description: "Comfortably performant 2D renderer",
  version: "1.0.0",
});

// change options like color and schema
// query for a chunk
// add remove elements
