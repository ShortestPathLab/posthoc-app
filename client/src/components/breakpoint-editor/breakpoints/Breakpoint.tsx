import type { Fn, Pipe, Tuples, Objects, Call as $ } from "hotscript";
import type { EventTree } from "pages/tree/treeLayout.worker";
import type { FeatureDescriptor } from "protocol/FeatureQuery";
import type { ReactElement } from "react";
import { UploadedTrace } from "slices/UIState";
import type { Breakpoint } from "../BreakpointEditor";

export type TreeDict = {
  [K in number]: EventTree;
};

export type BreakpointData = Breakpoint & { steps?: "" };

export type BreakpointFieldProps<T> = {
  layer?: string;
  value?: T | undefined;
  disabled?: boolean;
  properties?: string[];
  conditions?: string[];
  onChange?: (value: T) => void;
};
type KeyValue = {
  key: string;
  value: unknown;
};
type KeyValueTuple = [...KeyValue[]];
interface MapKeyValueFn extends Fn {
  return: [this["arg0"]["key"], this["arg0"]["value"]];
}

export type BreakpointProcessorOutput = Promise<
  | {
      result: string;
      step: number;
    }[]
  | {
      error: string;
    }
>;

export type BreakpointProcessor<P extends KeyValueTuple> = (
  data: Pipe<
    P,
    [Tuples.Map<MapKeyValueFn>, Tuples.ToUnion, Objects.FromEntries]
  >,
  trace: UploadedTrace,
  trees: TreeDict
) => BreakpointProcessorOutput;
type Field<K, R> = {
  key: K;
  component: ReactElement<BreakpointFieldProps<R>>;
};
interface ToFieldsFn extends Fn {
  return: Field<this["arg0"]["key"], this["arg0"]["value"]>;
}

export type BreakpointHandler<
  T extends string = string,
  P extends KeyValueTuple = KeyValueTuple
> = {
  id: T;
  processor: BreakpointProcessor<P>;
  fields: $<Tuples.Map<ToFieldsFn>, P>;
} & Omit<FeatureDescriptor, "lastModified">;
