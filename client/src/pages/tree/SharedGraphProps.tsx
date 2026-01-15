import { Trace } from "protocol";

export type SharedGraphProps = {
  trace?: Trace;
  step?: number;
  layer?: string;
  showAllEdges?: boolean;
  trackedProperty?: string;
  width?: number;
  height?: number;
};
