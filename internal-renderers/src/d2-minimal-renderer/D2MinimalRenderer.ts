import { ceil, clamp, debounce, once, round } from "lodash";
import * as PIXI from "pixi.js";
import { Bounds } from "protocol";
import { ComponentEntry, makeRenderer, RemoveElementCallback } from "renderer";
import { D2RendererBase } from "../d2-renderer-base/D2RendererBase";
import { CompiledD2IntrinsicComponent } from "../d2-renderer/D2IntrinsicComponents";
import { D2RendererOptions } from "../d2-renderer/D2RendererOptions";
import { draw } from "../d2-renderer/draw";
import { intersect } from "../d2-renderer/intersect";

const { max, min } = Math;

const CANVAS_MAXSIZE = 4096 - 1;
const canvas = new OffscreenCanvas(1, 1);

const getCanvas = (w: number, h: number) => {
  canvas.width = max(1, ceil(w));
  canvas.height = max(1, ceil(h));
  canvas.getContext("2d")?.clearRect?.(0, 0, canvas.width, canvas.height);
  return canvas;
};

const getClampedScale = (size: number, maxScale: number) =>
  min(max(round(size) / devicePixelRatio, 1), maxScale);

class Elem extends PIXI.Sprite {
  #scale: number = 1;
  #maxScale: number = 1;
  constructor(
    public bounds: Bounds,
    private bodies: ReturnType<D2RendererBase["makeBodies"]>,
    scale: number
  ) {
    const maxScale =
      CANVAS_MAXSIZE /
      max(bounds.right - bounds.left, bounds.bottom - bounds.top, 1);
    super(getTexture(bounds, bodies, getClampedScale(scale, maxScale)));
    this.rerender(scale, bounds, bodies, maxScale);
    this.#maxScale = maxScale;
  }
  rerender(
    size: number,
    bounds = this.bounds,
    bodies = this.bodies,
    maxScale = this.#maxScale
  ) {
    const scale = getClampedScale(size, maxScale);
    if (scale === this.#scale) return;
    const texture = getTexture(bounds, bodies, scale);
    this.texture = texture;
    this.setTransform(bounds.left, bounds.top, 1 / scale, 1 / scale);
    this.#scale = scale;
  }
}

function getTexture(
  bounds: Bounds,
  bodies: ReturnType<D2RendererBase["makeBodies"]>,
  scale: number
) {
  const canvas = getCanvas(
    (bounds.right - bounds.left) * scale,
    (bounds.bottom - bounds.top) * scale
  );
  const ctx = canvas.getContext("2d")!;
  for (const { component } of bodies) {
    draw(component, ctx, {
      scale: { x: scale, y: scale },
      x: -(bounds.left * scale),
      y: -(bounds.top * scale),
    });
  }
  return PIXI.Texture.from(canvas.transferToImageBitmap());
}

export class D2MinimalRenderer extends D2RendererBase {
  #elements?: PIXI.Container<Elem>;
  #scale: number = 50;
  protected override setupPixi(options: D2RendererOptions) {
    super.setupPixi(options);
    if (!this.viewport) return;
    this.#elements = new PIXI.Container();
    this.viewport.addChild(this.#elements);
  }
  override add(
    components: ComponentEntry<CompiledD2IntrinsicComponent>[]
  ): RemoveElementCallback {
    if (components.length) {
      const remove = super.add(components);
      const bodies = this.makeBodies(components);
      const bounds = this.getBounds(bodies);
      const sprite = new Elem(bounds, bodies, 1 / this.getPx());
      this.#elements?.addChild?.(sprite);
      return () => {
        remove();
        this.#elements?.removeChild?.(sprite);
        sprite.destroy();
      };
    }
    return () => {};
  }

  protected getFrustumChangeQueue = once(() =>
    debounce(() => this.handleFrustumChange(), this.options.animationDuration)
  );

  protected override handleFrustumChange() {
    if (!this.#elements || !this.viewport) return;
    const scale = 1 / this.getPx();
    const { left, right, top, bottom } = this.viewport;
    for (const child of this.#elements.children) {
      if (intersect(child.bounds, { left, right, top, bottom })) {
        child.rerender(scale);
      } else {
        child.rerender(1);
      }
    }
  }
}

export default makeRenderer(D2MinimalRenderer, {
  components: ["rect", "circle", "path", "polygon"],
  id: "d2-minimal-renderer",
  name: "Pixel Nano",
  description: "Simple 2D renderer",
  version: "1.0.0",
});
