import { Dictionary } from "lodash";
import memo from "memoizee";
import { TraceComponent, TraceEvent } from "protocol/Trace";
import { NodeMatcher } from "./NodeMatcher";
import { Point } from "./Size";
import { Bounds, Scale } from "./Size";

export type MapParser = (map?: string, options?: any) => MapInfo;

export type MapInfo = {
  bounds: Bounds;
  nodes: TraceComponent[];
  snap: (point: Point, scale?: number) => Point | undefined;
  nodeAt: (point: Point) => number | undefined;
  pointOf: (node: number) => Point | undefined;
  matchNode: NodeMatcher;
};
