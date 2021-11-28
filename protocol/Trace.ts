export type TraceEventType =
  | "end"
  | "source"
  | "destination"
  | "expanding"
  | "generating"
  | "closing";

export type TraceEvent<V extends string = string> = {
  type?: TraceEventType;
  id?: number;
  variables?: { [K in V]: number };
  f?: number;
  g?: number;
  info?: string;
  pId?: number | null;
};

export type NodeStructure<V extends string = string> = {
  type?: string;
  variables?: { [K in V]: string };
  persisted?: boolean;
  drawPath?: boolean;
};

export type Trace<V extends string = string> = {
  nodeStructure?: NodeStructure<V>[];
  eventList?: TraceEvent<V>[];
};
