import { EventTree } from "pages/tree/treeLayout.worker";
import { TraceEvent, TraceEventType } from "protocol";

type ApplyOptions = {
  value: number;
  reference: number;
  step: number;
  events: TraceEvent[];
  event: TraceEvent;
  node: EventTree;
  type?: TraceEventType;
  property: string;
};

export type Comparator = {
  key: string;
  apply: (options: ApplyOptions) => boolean;
  needsReference?: boolean;
};
