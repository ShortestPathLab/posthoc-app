import { TraceEvent } from "protocol/Trace";
import { Point } from "./Size";

export type NodeMatcher<T extends string = string> = (
  s: TraceEvent<T>,
  point: Point
) => boolean;

export const byPoint: NodeMatcher<keyof Point> = ({ variables }, { x, y }) =>
  variables?.x === x && variables?.y === y;
