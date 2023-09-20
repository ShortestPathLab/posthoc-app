import { ColorTranslator } from "colortranslator";
import {
  CompiledD2IntrinsicComponent as CompiledD2Component,
  D2InstrinsicComponents as D2Components,
} from "d2-renderer/D2IntrinsicComponents";
import { Dictionary, maxBy, minBy } from "lodash";
import { Bounds, Point, Size } from "protocol";
import { defaultContext } from "./EventContext";

const { ceil, PI } = Math;

export type Transform = Point & {
  scale: Point;
};

export const getFillStyle = (fill: string, alpha: number) =>
  new ColorTranslator(fill).setA(alpha ?? defaultContext.alpha).RGBA;

export const getStrokeStyle = (fill: string, alpha: number) =>
  getFillStyle(fill, alpha);

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
      const a = transform(c, { x: c.textX, y: c.textY, scale: { x: 1, y: 1 } });
      const box = transform(a, t);
      g.font = `${c.fontSize * t.scale.x}px Arial`;
      g.fillStyle = getFillStyle(c.fontColor, c.alpha);
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
    g.beginPath();
    const box = transform({ ...c, width: c.radius, height: c.radius }, t);
    g.ellipse(
      ceil(box.x),
      ceil(box.y),
      ceil(box.width),
      ceil(box.height),
      0,
      0,
      2 * PI
    );
    g.fill();
  },
  test(c) {
    return {
      left: c.x - c.radius,
      right: c.x + c.radius,
      top: c.y - c.radius,
      bottom: c.y + c.radius,
    };
  },
};

export const polygon: Primitive<"polygon"> = {
  draw(c, g, t) {
    const [box, ...rest] = c.points;
    g.beginPath();
    g.fillStyle = getFillStyle(c.fill, c.alpha);
    const { x, y } = transform({ ...box, width: 0, height: 0 }, t);
    g.moveTo(ceil(x), ceil(y));
    for (const box of rest) {
      const { x, y } = transform({ ...box, width: 0, height: 0 }, t);
      g.lineTo(ceil(x), ceil(y));
    }
    g.closePath();
    g.fill();
  },
  test(c) {
    return {
      left: minBy(c.points, "x")?.x ?? 0,
      right: maxBy(c.points, "x")?.x ?? 0,
      top: minBy(c.points, "y")?.y ?? 0,
      bottom: maxBy(c.points, "y")?.y ?? 0,
    };
  },
};

export const path: Primitive<"path"> = {
  draw(c, g, t) {
    const [box, ...rest] = c.points;
    g.beginPath();
    g.lineCap = "round";
    g.lineJoin = "round";
    g.strokeStyle = getStrokeStyle(c.fill, c.alpha);
    const { x, y, width } = transform(
      { ...box, width: c.lineWidth, height: 0 },
      t
    );
    g.lineWidth = ceil(width);
    g.moveTo(ceil(x), ceil(y));
    for (const box of rest) {
      const { x, y } = transform({ ...box, width: 0, height: 0 }, t);
      g.lineTo(ceil(x), ceil(y));
    }
    g.stroke();
  },
  test(c) {
    return {
      left: minBy(c.points, "x")?.x ?? 0,
      right: maxBy(c.points, "x")?.x ?? 0,
      top: minBy(c.points, "y")?.y ?? 0,
      bottom: maxBy(c.points, "y")?.y ?? 0,
    };
  },
};

export const primitives: Dictionary<Primitive> = {
  text,
  path,
  rect,
  polygon,
  circle,
};
