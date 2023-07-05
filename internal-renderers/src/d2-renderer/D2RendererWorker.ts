import combinate from "combinate";
import { Body, System } from "detect-collisions";
import { Dictionary, ceil, floor, range, sortBy, throttle } from "lodash";
import memoizee from "memoizee";
import type { Bounds } from "protocol";
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

const z = (x: number) => floor(log2(x));

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

type BodyWithComponent = Body & {
  component: CompiledD2IntrinsicComponent;
  index: number;
};

export class D2RendererWorker extends EventEmitter<
  D2RendererEvents & {
    message: (event: D2WorkerEvent, transfer: Transferable[]) => void;
  }
> {
  #options: D2RendererOptions = defaultD2RendererOptions;
  #frustum: Bounds = { bottom: 256, top: 0, left: 0, right: 256 };
  #system = new System<BodyWithComponent>();
  #children: Dictionary<BodyWithComponent[]> = {};

  getView() {
    return { system: this.#system };
  }

  setFrustum(frustum: Bounds) {
    this.#frustum = frustum;
    this.#enqueueRender();
  }

  #count: number = 0;

  #next() {
    return this.#count++;
  }

  add(component: CompiledD2IntrinsicComponent[], id: string) {
    this.#children[id] = [];
    for (const c of component) {
      const body = Object.assign(primitives[c.$].test(c), {
        component: c,
        index: this.#next(),
      });
      this.#system.insert(body);
      this.#children[id].push(body);
    }
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
    this.#enqueueRender();
  }

  getZoom({ top, left, bottom, right }: Bounds) {
    const { tileSubdivision } = this.#options;
    return max(z(right - left), z(bottom - top)) - tileSubdivision;
  }

  async render() {
    const zoom = this.getZoom(this.#frustum);
    const order = 2 ** zoom;
    const tiles = {
      left: floor(this.#frustum.left / order),
      right: ceil((this.#frustum.right + 1) / order),
      top: floor(this.#frustum.top / order),
      bottom: ceil((this.#frustum.bottom + 1) / order),
    };
    for (const { x, y } of combinate({
      x: range(tiles.left, tiles.right + 1),
      y: range(tiles.top, tiles.bottom + 1),
    })) {
      if (this.#shouldRender(x, y)) {
        const bounds = this.getTileBounds(x, y, zoom);
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

  #enqueueRender = throttle(
    () => this.render(),
    this.#options.refreshInterval,
    {
      leading: false,
      trailing: true,
    }
  );

  #shouldRender(x: number, y: number) {
    const { workerCount, workerIndex } = this.#options;
    return pointToIndex({ x, y }) % workerCount === workerIndex;
  }

  getTileBounds(x: number, y: number, zoom: number) {
    const order = 2 ** zoom;
    const mapX = x * order;
    const mapY = y * order;
    return {
      left: mapX - order / 2,
      right: mapX + order / 2,
      top: mapY - order / 2,
      bottom: mapY + order / 2,
    } as Bounds;
  }

  renderTile = memoizee((b: Bounds) => this.#renderTile(b), {
    normalizer: JSON.stringify,
    max: 50,
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
