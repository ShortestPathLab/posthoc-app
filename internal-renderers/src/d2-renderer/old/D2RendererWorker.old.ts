import * as PIXI from "@pixi/webworker";
import combinate from "combinate";
import { Dictionary, ceil, floor, range, throttle } from "lodash";
import type { Bounds } from "protocol";
import { clear, Memoize as memo } from "typescript-memoize";
import { CompiledD2IntrinsicComponent } from "../D2IntrinsicComponents";
import {
  D2RendererEvents,
  D2RendererOptions,
  defaultD2RendererOptions,
} from "../D2RendererOptions";
import { EventEmitter } from "../EventEmitter";
import { draw } from "../draw";
import { pointToIndex } from "../pointToIndex";

const { log2, max } = Math;

const z = (x: number) => floor(log2(x));

const memoOptions: Parameters<typeof memo>[0] = {
  expiring: 1000 * 60,
  hashFunction: JSON.stringify,
  tags: ["d2-renderer-cache"],
};

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

export class D2RendererWorker extends EventEmitter<
  D2RendererEvents & {
    message: (event: D2WorkerEvent, transfer: Transferable[]) => void;
  }
> {
  #app: PIXI.Application<OffscreenCanvas> = new PIXI.Application({
    autoStart: false,
  });
  #world: PIXI.Container = new PIXI.Container();
  #options: D2RendererOptions = defaultD2RendererOptions;
  #frustum: Bounds = { bottom: 256, top: 0, left: 0, right: 256 };
  #children: Dictionary<PIXI.Graphics> = {};

  getView() {
    return { app: this.#app, world: this.#world };
  }

  setFrustum(frustum: Bounds) {
    this.#frustum = frustum;
    this.#enqueueRender();
  }

  add(component: CompiledD2IntrinsicComponent[], id: string) {
    const g = new PIXI.Graphics();
    g.name = id;
    // draw(component, g);
    this.#world.addChild(g);
    this.#children[id] = g;
    this.#invalidate();
  }

  remove(id: string) {
    this.#children[id].removeFromParent();
    delete this.#children[id];
    this.#invalidate();
  }

  setup(options: D2RendererOptions) {
    this.#options = options;
    this.#setupPixi(options);
    this.#invalidate();
  }

  #setupPixi(options: D2RendererOptions) {
    this.#app = new PIXI.Application({
      autoStart: false,
      antialias: false,
      background: ["#03045e", "#023e8a", "#0077b6", "#0096c7"][
        options.workerIndex
      ],
      width: options.tileResolution.width,
      height: options.tileResolution.height,
    });
    this.#world = new PIXI.Container();
    this.#app.stage.addChild(this.#world);
  }

  #invalidate() {
    clear(["d2-renderer-cache"]);
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

  @memo(memoOptions)
  renderTile(bounds: Bounds) {
    const { top, right, bottom, left } = bounds;
    const { tileResolution: tile } = this.#options;
    const scale = {
      x: tile.width / (right - left),
      y: tile.height / (bottom - top),
    };
    this.#world?.setTransform?.(
      -left * scale.x,
      -top * scale.y,
      scale.x,
      scale.y
    );
    this.#app.render();
    return this.#app.view.transferToImageBitmap();
  }
}
