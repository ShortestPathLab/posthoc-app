/**
 * Search Trace format definition
 */

export type TraceEventType =  
    "source" 
  | "destination" 
  | "generating" 
  | "updating"
  | "closing" 
  | "expanding" 
  | "end";

export type TraceEvent = {
  type?: TraceEventType;
  id: number | string;
  pId?: number | string | null;
  f?: number;
  g?: number;
  h?: number;
  [key: string] : any;
}

export type TraceComponent = {
  "$": string;
  [key: string]: any;
}

export type TraceComponents = {
  [key: string]: TraceComponent[];
}

export type TraceContext = {
  [key: string]: any;
}

export type TraceView = {
  renderer?: string;
  components?: TraceComponent[];
  persist?: boolean;
}

export type TraceViews = {
  main?: TraceView;
  [key: string]: TraceView | undefined;
}

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
};

export type Trace = {
  version?: string;
  context?: object;
  render?: TraceRender;
  eventList?: TraceEvent[];
};