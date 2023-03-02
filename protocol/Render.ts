import { TraceComponent, TraceComponents, TraceEvent, TraceRender, TraceView, TraceViews, TraceEventType } from "./Trace";

/**
 * Type Definition used by renderers and interlang, to differenciate from
 * search trace types
 */

export type Component = TraceComponent;

export type Components = TraceComponents;

export type Event = TraceEvent;

export type Views = TraceViews;

export type View = TraceView;

export type Render = TraceRender;

export type Point = {
  x: number;
  y: number;
}

/**
 * Store events as an ID:Events map, according to renderers main logic:
 * render nodes in different stages(types), a node can only in a specific
 * stage at a given time, and a node can "experience" different stages.
 */
export type Nodes = Map<string|number, Event[]>

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