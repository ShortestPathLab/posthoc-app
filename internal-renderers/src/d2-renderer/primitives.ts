import { ColorTranslator } from "colortranslator";
import {
  CompiledD2IntrinsicComponent as CompiledD2Component,
  D2InstrinsicComponents as D2Components,
} from "d2-renderer/D2IntrinsicComponents";
import { Dictionary } from "lodash";
import { Bounds, Point, Size } from "protocol";
import { defaultContext } from "./EventContext";

const { ceil } = Math;

export type Transform = Point & {
  scale: Point;
};

export const getFillStyle = (fill: string, alpha: number) =>
  new ColorTranslator(fill).setA(alpha ?? defaultContext.alpha).RGBA;

export const getStrokeStyle = (fill: string, alpha: number, width: number) =>
  `${width}px ${getFillStyle(fill, alpha)}`;

type Box = Size & Point;

function transform(a: Box, t: Transform): Box {
  return {
    width: a.width * t.scale.x,
    height: a.height * t.scale.y,
    x: a.x * t.scale.x + t.x,
    y: a.y * t.scale.y + t.y,
  };
}

type Primitive<T extends keyof D2Components = keyof D2Components> = {
  draw(
    c: CompiledD2Component<T>,
    g: OffscreenCanvasRenderingContext2D,
    t: Transform
  ): void;
  test(c: CompiledD2Component<T>): Bounds;
};

export const text: Primitive<any> = {
  draw(c, g, t) {
    if (c.text) {
      const box = transform(c, t);
      g.font = `${c.fontSize * t.scale.x}px Arial`;
      g.fillStyle = getFillStyle(c.fill, 1);
      g.fillText(c.text, box.x, box.y);
    }
  },
  test(c) {
    return {
      left: c.x,
      right: c.x,
      top: c.y,
      bottom: c.y,
    };
  },
};

export const rect: Primitive<"rect"> = {
  draw(c, g, t) {
    const { x, y, width, height } = transform(c, t);
    g.fillStyle = getFillStyle(c.fill, c.alpha);
    g.fillRect(ceil(x), ceil(y), ceil(width) || 1, ceil(height) || 1);
  },
  test(c) {
    return {
      left: c.x,
      right: c.x + c.width,
      top: c.y,
      bottom: c.y + c.height,
    };
  },
};

export const circle: Primitive<"circle"> = {
  draw(c, g, t) {
    g.fillStyle = getFillStyle(c.fill, c.alpha);
    const box = transform({ ...c, width: c.radius, height: c.radius }, t);
    g.ellipse(box.x, box.y, box.width, box.height, 0, 0, 0);
    g.fill();
  },
  test(c) {
    return {
      left: c.x,
      right: c.x + c.radius,
      top: c.y,
      bottom: c.y + c.radius,
    };
  },
};

export const polygon: Primitive<"polygon"> = {
  draw(c, g, t) {
    const [{ x, y }, ...rest] = c.points;
    g.fillStyle = getFillStyle(c.fill, c.alpha);
    g.beginPath();
    g.moveTo(x + t.x, y + t.y);
    for (const { x, y } of rest) {
      g.lineTo(x + t.x, y + t.y);
    }
    g.closePath();
    g.fill();
  },
  test(c) {
    return { left: c.x, right: c.x, top: c.y, bottom: c.y };
  },
};

export const path: Primitive<"path"> = {
  draw(c, g, t) {
    const [{ x, y }, ...rest] = c.points;
    g.beginPath();
    g.strokeStyle = getStrokeStyle(c.fill, c.alpha, c.lineWidth);
    g.moveTo(x + t.x, y + t.y);
    for (const { x, y } of rest) {
      g.lineTo(x + t.x, y + t.y);
    }
    g.closePath();
    g.stroke();
  },
  test(c) {
    return { left: c.x, right: c.x, top: c.y, bottom: c.y };
  },
};

export const primitives: Dictionary<Primitive> = {
  text,
  path,
  rect,
  polygon,
  circle,
};
