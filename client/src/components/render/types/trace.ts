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
  [key: string] : any;
}

export type TraceComponent = {
  "$": string;
  [key: string]: any;
}[]

export type TraceComponents = {
  [key: string]: TraceComponent;
}

export type TraceContext = {
  [key: string]: any;
}

export type TraceViews = {
  main: TraceComponent | string;
  [key: string]: TraceComponent | string;
}

export type TraceRendererDefination = {
  context?: TraceContext;
  components: TraceComponents;
  views: TraceViews;
}

export type Trace = {
  version: string;
  render: TraceRendererDefination;
  eventList: TraceEvent[];
}