import { ReactNode } from "react";

export type Properties = Record<string, unknown>;

export type FlowData<T extends string, Properties> = {
  key: string;
  type: T;
  fields: Properties;
};

export type FlowEdgeData = {
  source: string;
  target: string;
};

export type LabelProps<V extends Properties> = {
  key: keyof V;
  label: string;
  description?: string;
  value?: any;
  type: "any" | "number" | "string" | "boolean";
};

export type TransformationNodeConfig<
  K extends string,
  V extends Properties,
  I extends Properties = Properties,
  O extends Properties = Properties,
> = {
  key: K;
  title: ReactNode;
  description?: string;
  group?: string;
  inputs?: LabelProps<I>[]; // list of handles on the left
  outputs?: LabelProps<O>[]; // list of handles on the right
  fields?: {
    key: keyof V;
    label: string;
    type: "text" | "number" | "checkbox";
    value: unknown;
  }[];
};

export function createFlowNodeDefinition<
  T extends FlowData<string, Properties>,
  U = TransformationNodeConfig<T["type"], T["fields"]>,
>(t: (v?: T["fields"]) => U): (v?: T["fields"]) => U {
  return t instanceof Function ? t : () => t;
}
