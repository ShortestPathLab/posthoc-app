import { Trace } from "protocol/Trace-v140";

export type SharedGraphProps = {
  trace?: Trace;
  traceKey?: string;
  step?: number;
  layer?: string;
  showAllEdges?: boolean;
  trackedProperty?: string;
  width?: number;
  height?: number;
};
