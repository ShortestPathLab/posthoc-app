import { TraceEvent } from "protocol/Trace";
import { FunctionComponent } from "react";

type Node = {
  index: number;
  event: TraceEvent;
};

export type SelectionInfo = {
  current?: Node;
  entry?: Node;
};

export type Point = {
  x: number;
  y: number;
};

export type SelectEvent = {
  global: Point;
  world: Point;
  info: SelectionInfo;
};

export type RendererProps = {
  onSelect?: (e: SelectEvent) => void;
  selection?: Point;
  width?: number;
  height?: number;
};

export type Renderer = FunctionComponent<RendererProps>;
