import { ColorTranslator } from "colortranslator";
import {
  CompiledD2IntrinsicComponent as CompiledD2Component,
  D2InstrinsicComponents as D2Components,
} from "d2-renderer/D2IntrinsicComponents";
import { Body, Ellipse, Box as Rect } from "detect-collisions";
import { Dictionary } from "lodash";
import { Bounds, Point, Size } from "protocol";
import { defaultContext } from "./EventContext";

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
  test(c: CompiledD2Component<T>): Body;
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
    return new Rect(c, c.width, c.fontSize);
  },
};

export const rect: Primitive<"rect"> = {
  draw(c, g, t) {
    const { x, y, width, height } = transform(c, t);
    g.fillStyle = getFillStyle(c.fill, c.alpha);
    g.fillRect(x, y, width, height);
  },
  test(c) {
    return new Rect(c, c.width, c.height);
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
    // TODO: Write collision
    return new Ellipse(c, c.radius);
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
    // TODO: Write collision
    return new Rect(c, 1, 1);
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
    // TODO: Write collision
    return new Rect(c, 1, 1);
  },
};

export const primitives: Dictionary<Primitive> = {
  text,
  path,
  rect,
  polygon,
  circle,
};
