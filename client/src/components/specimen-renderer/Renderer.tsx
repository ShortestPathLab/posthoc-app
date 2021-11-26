import { TraceEvent } from "protocol/Trace";
import { FunctionComponent } from "react";
import { PathfindingTask, PathfindingTaskInstance } from "protocol/SolveTask";
import { ParamsOf } from "protocol/Message";

type Step = {
  index: number;
  event: TraceEvent;
};

type Node = {
  key: number;
};

export type SelectionInfo = {
  current?: Step;
  entry?: Step;
  node?: Node;
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

export type RendererEntry = [
  FunctionComponent<RendererProps>,
  (map?: string) => PathfindingTaskInstance
];

export type RendererMap = {
  [K in string]: RendererEntry;
};
