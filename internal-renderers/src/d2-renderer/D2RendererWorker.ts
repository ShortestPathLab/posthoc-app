import combinate from "combinate";
import {
  Dictionary,
  ceil,
  floor,
  map,
  once,
  range,
  sortBy,
  throttle,
} from "lodash";
import memoizee from "memoizee";
import type { Bounds, Point } from "protocol";
import RBush from "rbush";
import { CompiledD2IntrinsicComponent } from "./D2IntrinsicComponents";
import {
  D2RendererEvents,
  D2RendererOptions,
  defaultD2RendererOptions,
} from "./D2RendererOptions";
import { EventEmitter } from "./EventEmitter";
import { draw } from "./draw";
import { pointToIndex } from "./pointToIndex";
import { primitives } from "./primitives";

const { log2, max } = Math;

const z = (x: number) => floor(log2(x + 1));

export function getTiles(
  { right, left, bottom, top }: Bounds,
  tileSubdivision: number
) {
  const zoom = max(z(right - left), z(bottom - top)) - tileSubdivision;
  const order = 2 ** zoom;
  const tiles = {
    left: floor(left / order),
    right: ceil((right + 1) / order),
    top: floor(top / order),
    bottom: ceil((bottom + 1) / order),
  };
  return {
    zoom,
    order,
    tiles: combinate({
      x: range(tiles.left, tiles.right + 1),
      y: range(tiles.top, tiles.bottom + 1),
    }).map((tile) => {
      const mapX = tile.x * order;
      const mapY = tile.y * order;
      return {
        tile,
        bounds: {
          left: mapX - order / 2,
          right: mapX + order / 2,
          top: mapY - order / 2,
          bottom: mapY + order / 2,
        },
      };
    }),
  };
}

export type D2WorkerRequest<
  T extends keyof D2RendererWorker = keyof D2RendererWorker
> = {
  action: T;
  payload: Parameters<D2RendererWorker[T]>;
};

export type D2WorkerEvents = {
  update: {
    bounds: Bounds;
    bitmap: ImageBitmap;
  };
};

export type D2WorkerEvent<
  T extends keyof D2WorkerEvents = keyof D2WorkerEvents
> = {
  action: T;
  payload: D2WorkerEvents[T];
};

type Body = Bounds & {
  component: CompiledD2IntrinsicComponent;
  index: number;
};

class Bush extends RBush<Body> {
  toBBox(b: Body) {
    return { minX: b.left, minY: b.top, maxX: b.right, maxY: b.bottom };
  }
  compareMinX(a: Body, b: Body) {
    return a.left - b.left;
  }
  compareMinY(a: Body, b: Body) {
    return a.top - b.top;
  }
}

const TILE_CACHE_SIZE = 200;

export class D2RendererWorker extends EventEmitter<
  D2RendererEvents & {
    message: (event: D2WorkerEvent, transfer: Transferable[]) => void;
  }
> {
  #options: D2RendererOptions = defaultD2RendererOptions;
  #frustum: Bounds = { bottom: 256, top: 0, left: 0, right: 256 };
  #system: Bush = new Bush(16);
  #children: Dictionary<Body[]> = {};

  getView() {
    return { system: this.#system };
  }

  setFrustum(frustum: Bounds) {
    this.#frustum = frustum;
    this.#getRenderQueue()();
  }

  #count: number = 0;

  #next() {
    return this.#count++;
  }

  add(component: CompiledD2IntrinsicComponent[], id: string) {
    const bodies = map(component, (c) => ({
      ...primitives[c.$].test(c),
      component: c,
      index: this.#next(),
    }));
    this.#system.load(bodies);
    this.#children[id] = bodies;
    this.#invalidate();
  }

  remove(id: string) {
    for (const c of this.#children[id]) {
      this.#system.remove(c);
    }
    delete this.#children[id];
    this.#invalidate();
  }

  setup(options: D2RendererOptions) {
    this.#options = options;
    this.#invalidate();
  }

  #invalidate() {
    this.renderTile.clear();
    this.#getRenderQueue()();
  }

  async render() {
    for (const { tile, bounds } of getTiles(
      this.#frustum,
      this.#options.tileSubdivision
    ).tiles) {
      if (this.#shouldRender(tile)) {
        const bitmap = await createImageBitmap(this.renderTile(bounds));
        this.emit(
          "message",
          {
            action: "update",
            payload: {
              bounds,
              bitmap,
            },
          },
          [bitmap]
        );
      }
    }
  }

  #getRenderQueue = once(() =>
    throttle(() => this.render(), this.#options.refreshInterval, {
      leading: false,
      trailing: true,
    })
  );

  #shouldRender({ x, y }: Point) {
    const { workerCount, workerIndex } = this.#options;
    return pointToIndex({ x, y }) % workerCount === workerIndex;
  }

  renderTile = memoizee((b: Bounds) => this.#renderTile(b), {
    normalizer: JSON.stringify,
    max: TILE_CACHE_SIZE,
  });

  #renderTile(bounds: Bounds) {
    const { top, right, bottom, left } = bounds;
    const { tileResolution: tile } = this.#options;
    const scale = {
      x: tile.width / (right - left),
      y: tile.height / (bottom - top),
    };
    const g = new OffscreenCanvas(tile.width, tile.height);
    const ctx = g.getContext("2d", { alpha: false })!;
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = this.#options.backgroundColor;
    ctx.fillRect(0, 0, tile.width, tile.height);
    for (const { component } of sortBy(
      this.#system.search({
        minX: left,
        maxX: right,
        maxY: bottom,
        minY: top,
      }),
      "index"
    )) {
      draw(component, ctx, {
        scale,
        x: -left * scale.x,
        y: -top * scale.y,
      });
    }
    return g.transferToImageBitmap();
  }
}
