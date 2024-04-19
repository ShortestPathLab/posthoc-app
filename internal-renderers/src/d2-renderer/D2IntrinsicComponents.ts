import { CompiledComponent, ParsedComponent, Point } from "protocol";

export type D2Base = {
  /// version < 1.4.0 compat
  label: string;
  text: string;
  fontSize: number;
  fill: string;
  x: number;
  y: number;
  alpha: number;
};

export type D2Rect = D2Base & {
  width: number;
  height: number;
};

export type D2Circle = D2Base & {
  radius: number;
};

export type D2Polygon = D2Base & {
  points: Point[];
};

export type D2Path = D2Polygon & {
  lineWidth: number;
};

export type D2InstrinsicComponents = {
  rect: D2Rect;
  circle: D2Circle;
  polygon: D2Polygon;
  path: D2Path;
};

export type ParsedD2IntrinsicComponent<
  T extends keyof D2InstrinsicComponents = keyof D2InstrinsicComponents
> = ParsedComponent<T, D2InstrinsicComponents[T]>;

export type CompiledD2IntrinsicComponent<
  T extends keyof D2InstrinsicComponents = keyof D2InstrinsicComponents
> = CompiledComponent<T, D2InstrinsicComponents[T]>;
