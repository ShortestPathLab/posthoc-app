/**
 * Search Trace format definition
 */

export type TraceEventType =  
    "source" 
  | "destination" 
  | "generating" 
  | "closing" 
  | "expanding" 
  | "end";

export type TraceEvent = {
  type?: TraceEventType;
  id?: number;
  pId?: number;
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
  renderer: string,
  components: TraceComponent[]
}

export type TraceViews = {
  main: TraceView
  [key: string]: TraceView
}

export type TraceRender = {
  context?: TraceContext;
  components: TraceComponents;
  views: TraceViews;
}

export type Trace = {
  version: string;
  render: TraceRender;
  eventList: TraceEvent[];
}