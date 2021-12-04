import { TraceEvent } from "protocol/Trace";
import { Point } from "./Renderer";

export type NodePredicate<T extends string = string> = (
  s: TraceEvent<T>,
  point: Point
) => boolean;

export const byPoint: NodePredicate<keyof Point> = ({ variables }, { x, y }) =>
  variables?.x === x && variables?.y === y;
