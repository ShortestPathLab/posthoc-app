import { Event } from "../../render/types";
import { Component } from "../../render/types";

type HexColor = `#${string}` | `0x${string}` | number;

// TODO Runtime type check for components and event data

export type Point = {
  x: number;
  y: number;
}

export type BezierPoint = Point & {
  control1?: Point;
  control2?: Point;
}

export type D2IntrinsicComponent = Component & {
  fill?: HexColor;
  alpha?: number;
  text?: string;
}

export type LineIntrinsicComponent = D2IntrinsicComponent & {
  $: "line";
  width: number;
  point1: Point;
  point2: Point;
}

export type RectIntrinsicComponent = D2IntrinsicComponent & {
  $: "rect";
  width: number;
  height: number;
  point: Point;
}

export type CircleIntrinsicComponent = D2IntrinsicComponent & {
  $: "circle";
  radius: number;
  point: Point;
}

export type PolygonIntrinsicComponent = D2IntrinsicComponent & {
  $: "polygon";
  points: Point[];
}

export type BezierPathIntrinsicComponent = D2IntrinsicComponent & {
  $: "path";
  path: [BezierPoint, ...BezierPoint[], Point];
};

/**
 * Event data types for development reference
 */

export type LineData = Event & {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export type RectData = Event & {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type CircleData = Event & {
  x: number;
  y: number;
  radius: number;
}