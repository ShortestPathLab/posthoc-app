import combinate from "combinate";
import {
  Dictionary,
  ceil,
  debounce,
  floor,
  isEqual,
  map,
  once,
  range,
  shuffle,
  sortBy,
} from "lodash";
import memo from "memoizee";
import type { Bounds, Point, Size } from "protocol";
import { ComponentEntry } from "renderer";
import { Bush } from "./Bush";
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

const hash = JSON.stringify;

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
    tiles: shuffle(
      combinate({
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
      })
    ),
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

export type Body<T> = Bounds &
  ComponentEntry<T> & {
    index: number;
  };

const TILE_CACHE_SIZE = 200;

export class D2RendererWorker extends EventEmitter<
  D2RendererEvents & {
    message: (event: D2WorkerEvent, transfer: Transferable[]) => void;
  }
> {
  #options: D2RendererOptions = defaultD2RendererOptions;
  #frustum: Bounds = { bottom: 256, top: 0, left: 0, right: 256 };
  #system: Bush<CompiledD2IntrinsicComponent> = new Bush(16);
  #children: Dictionary<Body<CompiledD2IntrinsicComponent>[]> = {};

  getView() {
    return { system: this.#system, world: this.#children };
  }

  setFrustum(frustum: Bounds) {
    this.#frustum = frustum;
    this.#getRenderQueue()();
  }

  setTileResolution(tileResolution: Size) {
    if (!isEqual(tileResolution, this.#options.tileResolution)) {
      Object.assign(this.#options, { tileResolution });
      this.#invalidate();
    }
  }

  #count: number = 0;

  #next() {
    return this.#count++;
  }

  #cache: { [K in string]: { key: string; tile: ImageBitmap } } = {};

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
        const bitmap = this.renderTile(bounds, this.#options.tileResolution);
        if (bitmap) {
          this.emit(
            "message",
            {
              action: "update",
              payload: {
                bounds,
                bitmap,
              },
            },
            []
          );
        }
      }
    }
  }

  #getRenderQueue = once(() =>
    debounce(() => this.render(), this.#options.refreshInterval, {
      leading: false,
      trailing: true,
    })
  );

  #shouldRender({ x, y }: Point) {
    const { workerCount, workerIndex } = this.#options;
    return pointToIndex({ x, y }) % workerCount === workerIndex;
  }

  renderTile = memo((b: Bounds, t: Size) => this.#renderTile(b, t), {
    normalizer: JSON.stringify,
    max: TILE_CACHE_SIZE,
  });

  #renderTile(bounds: Bounds, tile: Size) {
    const { top, right, bottom, left } = bounds;
    const scale = {
      x: tile.width / (right - left),
      y: tile.height / (bottom - top),
    };
    const bodies = sortBy(
      this.#system.search({
        minX: left,
        maxX: right,
        maxY: bottom,
        minY: top,
      }),
      "index"
    );
    const newKey = hash(map(bodies, "index"));
    const prevKey = hash([top, right, bottom, left]);
    const oldTile = this.#cache[prevKey];
    if (!oldTile || newKey !== oldTile.key) {
      const g = new OffscreenCanvas(tile.width, tile.height);
      const ctx = g.getContext("2d")!;
      ctx.imageSmoothingEnabled = false;
      // ctx.fillStyle = this.#options.backgroundColor;
      // ctx.fillRect(0, 0, tile.width, tile.height);

      const length = tile.width * 0.05;
      const thickness = 1;
      ctx.fillStyle = `rgba(127,127,127,0.36)`;
      ctx.fillRect(
        (tile.width - length) / 2,
        (tile.height - thickness) / 2,
        length,
        thickness
      );
      ctx.fillRect(
        (tile.width - thickness) / 2,
        (tile.height - length) / 2,
        thickness,
        length
      );

      for (const { component } of bodies) {
        draw(component, ctx, {
          scale,
          x: -left * scale.x,
          y: -top * scale.y,
        });
      }
      const bitmap = g.transferToImageBitmap();

      this.#cache[prevKey] = { key: newKey, tile: bitmap };
      return bitmap;
    } else {
      return oldTile.tile;
    }
  }
}
