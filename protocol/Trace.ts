/**
 * Search Trace format definition
 */

export type Properties = { [K in string]: any };

export type TraceEventType = string;

export type TraceEvent = {
  type?: TraceEventType;
  id: number | string;
  pId?: number | string | null;
  f?: number;
  g?: number;
  h?: number;
  [key: string]: any;
};

export type TraceComponent<
  T extends string = string,
  U extends Properties = Properties
> = U & {
  $: T;
};

export type TraceComponents<
  T extends string = string,
  U extends Properties = Properties
> = {
  [K in string]: TraceComponent<T, U>[];
};

export type TraceContext = {
  [key: string]: any;
};

export type TraceView = {
  renderer?: string;
  components?: TraceComponent[];
  onionSkin?: number;
};

export type TraceViews = {
  main?: TraceView;
  [key: string]: TraceView | undefined;
};

export type NodeStructure<V extends string = string> = {
  type?: string;
  variables?: { [K in V]: string };
  persisted?: boolean;
  drawPath?: boolean;
};

export type TraceRender = {
  context?: TraceContext;
  components?: TraceComponents;
  views?: TraceViews;
  path?: {
    pivot?: { x?: string; y?: string; z?: string };
    scale?: number;
  };
};

export type Trace = {
  version?: string;
  render?: TraceRender;
  events?: TraceEvent[];
};
