import { TraceEvent } from "protocol/Trace";
import { Point } from "./Size";

export type NodeMatcher = (s: TraceEvent, point: Point) => boolean;

export const byPoint: NodeMatcher = ({ variables }, { x, y }) =>
  variables?.x === x && variables?.y === y;
