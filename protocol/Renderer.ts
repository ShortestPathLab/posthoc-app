import {
  TraceComponent,
  TraceComponents,
  TraceEvent,
  TraceRender,
  TraceView,
  TraceViews,
  TraceEventType,
  Properties,
} from "./Trace";

export type EventContext = {
  parent?: Event | undefined;
  nodes?: Nodes;
  scale?: number;
  current?: TraceEvent | null;
  events?: TraceEvent[] | null;
  color?: EventTypeColors;
  [key: string]: any;
} & Partial<Event>;

export type ParsedProperty<T extends Properties, K extends keyof T> = (
  context: EventContext
) => T[K];

/**
 * Type Definition used by renderers and intermediate language, to differentiate from
 * search trace types
 */

export type ParsedProperties<T extends Properties> = {
  [K in keyof T]: ParsedProperty<T, K>;
};

export type ParsedComponent<T extends string, U extends Properties> = {
  $: T;
} & ParsedProperties<U>;

export type CompiledComponent<T extends string, U extends Properties> = {
  $: T;
} & U;

export type IntrinsicComponentMap<T extends string = string> = {
  [K in T]: Properties;
};

export type IntrinsicOnlyComponentDefinition<T extends IntrinsicComponentMap> =
  TraceComponent<Extract<keyof T, string>, T[keyof T]>[];

export type ParsedComponentDefinition<T extends IntrinsicComponentMap> =
  ParsedComponent<Extract<keyof T, string>, T[keyof T]>[];

export type ComponentDefinition<
  T extends string,
  U extends Properties = Properties
> = TraceComponent<T, U>[];

export type ComponentDefinitionMap<
  T extends string = string,
  U extends Properties = Properties
> = TraceComponents<T, U>;

export type Event = TraceEvent;

export type Views = TraceViews;

export type View = TraceView;

export type Render = TraceRender;

export type Point = {
  x: number;
  y: number;
  z?: number;
  w?: number;
};

export type Size = {
  width: number;
  height: number;
  depth?: number;
  w?: number;
};

export type Bounds = {
  front?: number;
  back?: number;
  top: number;
  bottom: number;
  left: number;
  right: number;
};

/**
 * Store events as an ID:Events map, according to renderers main logic:
 * render nodes in different stages(types), a node can only in a specific
 * stage at a given time, and a node can "experience" different stages.
 */
export type Nodes = Map<string | number, Event[]>;

export type EventTypeColors = {
  [key in TraceEventType]: string;
};
