/**
 * Search Trace format definition
 */

export type Properties = { [K in string]: any };

export type TraceEventType = string;

export type TraceEvent = {
  type?: TraceEventType;
  id: number | string;
  pId?: number | string | null;
  [key: string]: any;
};

export type TraceComponent<
  T extends string = string,
  U extends Properties = Properties
> = U & {
  $: T;
  clear?: boolean | string;
  $info?: any;
  $for?: { $let?: string; $from?: number; $to?: number; $step?: number };
  $if?: any;
};

export type TraceContext = {
  [key: string]: any;
};

export type TraceView = TraceComponent[];

export type TraceViews = {
  main?: TraceView;
  [key: string]: TraceView | undefined;
};

export type Trace = {
  version: "1.4.0";
  views?: { [K: string]: TraceComponent[] };
  events?: TraceEvent[];
  pivot?: { x?: any; y?: any; z?: any; scale?: number };
};
