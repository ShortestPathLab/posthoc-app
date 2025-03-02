import interpolate from "color-interpolate";
import combinate from "combinate";
import {
  Dictionary,
  chain as _,
  ceil,
  floor,
  get,
  head,
  identity,
  isEqual,
  isNumber,
  map,
  once,
  pick,
  range,
  shuffle,
  sortBy,
  throttle,
  truncate,
  values,
} from "lodash";
import { nanoid } from "nanoid";
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
import { hash } from "./hash";
import { pointToIndex } from "./pointToIndex";
import { primitives } from "./primitives";

const { log2, max } = Math;

const z = (x: number) => floor(log2(x + 1));

function wordWrap(text: string, width: number) {
  return _(text)
    .split(" ")
    .reduce(
      (prev, next) =>
        next.length + prev.width > width
          ? {
              text: `${prev.text}\n${next} `,
              width: next.length + 1,
            }
          : {
              text: `${prev.text}${next} `,
              width: prev.width + next.length + 1,
            },
      { width: 0, text: "" }
    )
    .value().text;
}

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
  T extends keyof D2RendererWorker = keyof D2RendererWorker,
> = {
  action: T;
  payload: Parameters<D2RendererWorker[T]>;
};

export type D2WorkerEvents = {
  update: {
    bounds: Bounds;
    bitmap?: ImageBitmap;
    hash: string;
  };
};

export type D2WorkerEvent<
  T extends keyof D2WorkerEvents = keyof D2WorkerEvents,
> = {
  action: T;
  payload: D2WorkerEvents[T];
};

export const defaultBounds = {
  top: 0,
  left: 0,
  right: 1,
  bottom: 1,
};

export type Body<T> = Bounds &
  ComponentEntry<T> & {
    index: number;
  };

export const isValue = (a: any) => isNumber(a) && !isNaN(a);

export class D2RendererWorker extends EventEmitter<
  D2RendererEvents & {
    message: (event: D2WorkerEvent, transfer: Transferable[]) => void;
  }
> {
  #now: number = 0;
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

  #cache: {
    [K in string]: { hash: string; tile: { width: number; height: number } };
  } = {};
  #errors: { [K in string]: string } = {};

  add(
    components: ComponentEntry<CompiledD2IntrinsicComponent>[],
    id: string,
    now: number
  ) {
    this.#now = now;
    const bodies = map(components, ({ component, meta }) => ({
      ...primitives[component.$].test(component),
      component,
      meta: pick(
        meta,
        "sourceLayerIndex",
        "sourceLayerAlpha",
        "sourceLayerDisplayMode"
      ),
      index: this.#next(),
    }));
    const b = bodies.find(
      (c) =>
        !isValue(c.top) ||
        !isValue(c.bottom) ||
        !isValue(c.left) ||
        !isValue(c.right)
    );
    if (b) {
      this.#errors[id] =
        `Component '${b.component.$}' is missing properties. Check these: width, height, x, y.`;
      return;
    }
    this.#system.load(bodies);
    this.#children[id] = bodies;
    this.#invalidate();
  }

  remove(id: string, now: number) {
    this.#now = now;
    map(this.#children[id], (c) => {
      this.#system.remove(c);
    });
    delete this.#children[id];
    delete this.#errors[id];
    this.#invalidate();
  }

  setup(options: D2RendererOptions) {
    this.#options = options;
    this.#invalidate();
  }

  #invalidate() {
    this.#getRenderQueue()();
  }

  loadFont = once(async () => {
    try {
      // Don't force font
      // Assume a font file at /fonts/inter.woff2, but ok if it doesn't exist
      const fontFace = new FontFace(
        "Inter",
        "local('Inter'), local('Inter UI'), url('/fonts/inter.woff2') format('woff2'), url(https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2) format('woff2'), local('-apple-system'), local('BlinkMacSystemFont'), local('Arial'), local('Helvetica'), local('sans-serif')"
      );
      // add it to the list of fonts our worker supports
      self.fonts.add(fontFace);
      // load the font
      await fontFace.load();
    } catch (e) {
      // Any problem loading font is ok.
      console.warn(e);
    }
  });

  async render() {
    await this.loadFont();
    for (const { tile, bounds } of getTiles(
      this.#frustum,
      this.#options.tileSubdivision
    ).tiles) {
      if (this.#shouldRender(tile)) {
        const out = this.renderTile(bounds, this.#options.tileResolution);
        if (out) {
          this.emit(
            "message",
            {
              action: "update",
              payload: {
                bounds,
                bitmap: out.bitmap,
                hash: out.hash,
              },
            },
            out.bitmap ? [out.bitmap] : []
          );
        }
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
    return (this.#now + pointToIndex({ x, y })) % workerCount === workerIndex;
  }

  renderTile = (b: Bounds, t: Size) => this.#renderTile(b, t);

  #getPx() {
    const { tileResolution, tileSubdivision } = this.#options;
    // Estimate a reasonable "1 screen pixel"
    return (tileResolution.width * 2 ** tileSubdivision) / 4096;
  }

  #drawError(tile: Size, e: string = "") {
    const fontSize = 64;
    const leading = 12;
    const { errorColor, backgroundColor } = this.#options;
    const g = new OffscreenCanvas(tile.width, tile.height);
    const ctx = g.getContext("2d", { alpha: false })!;
    ctx.imageSmoothingQuality = "high";
    const px = this.#getPx();

    ctx.fillStyle = interpolate([backgroundColor, errorColor])(0.05);
    ctx.fillRect(0, 0, tile.width, tile.height);

    ctx.font = `${px * fontSize}px Inter, Helvetica, Arial, sans-serif`;
    ctx.fillStyle = errorColor;

    for (const [a, i] of wordWrap(truncate(e, { length: 100 }), 28)
      .split("\n")
      .map((...args) => args)) {
      ctx.fillText(
        a,
        px * fontSize,
        px * fontSize * 2 + (leading + fontSize) * px * i
      );
    }

    ctx.lineWidth = px * 0.5;
    ctx.strokeStyle = errorColor;
    ctx.strokeRect(0, 0, tile.width, tile.height);

    return g;
  }

  #renderTile(bounds: Bounds, tile: Size) {
    try {
      const primitiveError = values(this.#errors).find(identity);
      if (primitiveError) throw new Error(primitiveError);

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
      const nextHash = hash(map(bodies, "index"));
      const tileKey = hash([top, right, bottom, left, tile.width, tile.height]);
      const prevTile = this.#cache[tileKey];
      if (
        !prevTile ||
        nextHash !== prevTile.hash ||
        // If previous tile had less resolution than current
        prevTile.tile.width + prevTile.tile.height < tile.width + tile.height
      ) {
        const g = new OffscreenCanvas(tile.width, tile.height);
        const ctx = g.getContext("2d", { alpha: false })!;
        ctx.imageSmoothingEnabled = false;

        ctx.fillStyle = this.#options.backgroundColor;
        ctx.fillRect(0, 0, tile.width, tile.height);

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
        _(bodies)
          .sortBy((c) => -(c.meta?.sourceLayerIndex ?? 0))
          .groupBy((c) => c.meta?.sourceLayerIndex ?? 0)
          .forEach((group) => {
            const g2 = new OffscreenCanvas(tile.width, tile.height);
            const ctx2 = g2.getContext("2d")!;
            for (const { component } of group) {
              draw(component, ctx2, {
                scale,
                x: -left * scale.x,
                y: -top * scale.y,
              });
            }
            const alpha = head(group)?.meta?.sourceLayerAlpha ?? 1;
            const displayMode =
              head(group)?.meta?.sourceLayerDisplayMode ?? "source-over";
            ctx.globalCompositeOperation = displayMode;
            ctx.globalAlpha = alpha;
            ctx.drawImage(g2, 0, 0);
          })
          .value();

        const bitmap = g.transferToImageBitmap();
        this.#cache[tileKey] = {
          hash: nextHash,
          tile: {
            width: bitmap.width,
            height: bitmap.height,
          },
        };

        return { hash: nextHash, bitmap };
      } else {
        return { hash: prevTile.hash };
      }
    } catch (e) {
      console.error(e);
      const g = this.#drawError(tile, get(e, "message"));
      return { hash: nanoid(), bitmap: g.transferToImageBitmap() };
    }
  }
}
