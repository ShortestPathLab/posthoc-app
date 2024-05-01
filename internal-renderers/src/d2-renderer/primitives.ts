import { ColorTranslator } from "colortranslator";
import {
  CompiledD2IntrinsicComponent as CompiledD2Component,
  D2InstrinsicComponents as D2Components,
} from "./D2IntrinsicComponents";
import { Dictionary, maxBy, minBy } from "lodash";
import { Bounds, Point, Size } from "protocol";
import { defaultContext } from "./EventContext";
import dist from "@turf/point-to-line-distance";
import { point, lineString } from "@turf/helpers";

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
  narrow(c: CompiledD2Component<T>, p: Point): boolean;
};

export const text: Primitive<any> = {
  draw(c, g, t) {
    /// version < 1.4.0 compat
    const _text = c.label ?? c.text;
    if (_text) {
      const a = transform(c, {
        x: c["label-x"] ?? c.textX ?? 0,
        y: c["label-y"] ?? c.textY ?? 0,
        scale: { x: 1, y: 1 },
      });
      const box = transform(a, t);
      g.font = `${(c["label-size"] ?? c.fontSize ?? 4) * t.scale.x}px Inter`;
      g.fillStyle = getFillStyle(
        c["label-color"] ?? c.fontColor ?? "grey",
        c.alpha
      );
      g.fillText(_text, box.x, box.y);
    }
  },
  test(c) {
    return {
      left: -Infinity,
      right: Infinity,
      top: -Infinity,
      bottom: Infinity,
    };
  },
  narrow() {
    return true;
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
  narrow() {
    return true;
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
  narrow() {
    return true;
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
  narrow() {
    return true;
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
      /// version < 1.4.0 compat
      { ...box, width: c["line-width"] ?? c.lineWidth, height: 0 },
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
    /// version < 1.4.0 compat
    const w = c["line-width"] ?? c.lineWidth;
    return {
      left: (minBy(c.points, "x")?.x ?? 0 - w ?? 0) - 1,
      right: (maxBy(c.points, "x")?.x ?? 0 + w ?? 0) + 1,
      top: (minBy(c.points, "y")?.y ?? 0 - w ?? 0) - 1,
      bottom: (maxBy(c.points, "y")?.y ?? 0 + w ?? 0) + 1,
    };
  },
  narrow(c, p) {
    return (
      dist(point([p.x, p.y]), lineString(c.points.map(({ x, y }) => [x, y]))) <
      500 * c.lineWidth
    );
  },
};

export const primitives: Dictionary<Primitive> = {
  text,
  path,
  rect,
  polygon,
  circle,
};
