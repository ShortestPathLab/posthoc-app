import { TraceEvent, TraceEventType } from "./trace";

export type EventTypeColours = {
  [key in TraceEventType]: string;
}

export type Context = {
  current?: TraceEvent | null;
  parent?: TraceEvent | null;
  events?: TraceEvent[] | null;
  colour?: EventTypeColours;
  [key: string]: any;
}