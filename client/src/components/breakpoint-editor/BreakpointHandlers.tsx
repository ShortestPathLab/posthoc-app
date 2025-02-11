import { UploadedTrace } from "slices/UIState";
import { Breakpoint } from "./BreakpointEditor2";
import { EventTree, Key } from "pages/tree/tree.worker";
import { comparators } from "./comparators";
import { find, forEach, get, map, startCase } from "lodash";
import {
  BreakPointSwitch,
  ConditionSelect,
  EventSelect,
  Header,
  PropertiesSelect,
  ReferenceInput,
} from "./BreakpointFields";
import { ComponentType } from "react";
import { TraceEvent } from "protocol";

export type TreeDict = {
  [K in number]: EventTree;
};

/**
 * This is the output data
 */
export type BreakpointData = Breakpoint & { steps?: "" };

/**
 * This type enforces that the React element for a field must accept properties `value` and `onChange`.
 */
export type BreakpointFieldProps<T> = {
  value?: T | undefined;
  disabled?: boolean;
  properties?: string[];
  conditions?: string[];
  onChange?: (value: T) => void;
};

export type BreakpointProcessor<P extends Record<string, unknown>> = (
  data: P,
  trace: UploadedTrace,
  trees: TreeDict
) => Promise<{ result: string; step: number }[] | { error: string }>;

export type BreakpointHandler<
  T extends string,
  P extends Record<string, unknown> = Record<string, unknown>
> = {
  type: T;
  processor: BreakpointProcessor<P>;
  fields: {
    [K in keyof P]: ComponentType<BreakpointFieldProps<P[K]>>;
  };
};

const breakpointHandler: BreakpointHandler<
  "Breakpoint",
  {
    eventType: string;
    active: boolean;
    property: string;
    reference: number;
    condition: string;
  }
> = {
  type: "Breakpoint",
  fields: {
    eventType: EventSelect,
    property: PropertiesSelect,
    condition: (props) =>
      ConditionSelect({
        ...props,
        conditions: map(comparators, (v) => v.key),
      }),
    reference: ReferenceInput,
    active: BreakPointSwitch,
  },
  processor: (
    data: Partial<Breakpoint>,
    trace: UploadedTrace,
    trees: TreeDict
  ) => breakPointProcessor(data, trace, trees),
};

const breakPointProcessor = async (
  data: Partial<Breakpoint>,
  trace: UploadedTrace,
  trees: TreeDict
): Promise<{ result: string; step: number }[] | { error: string }> => {
  return new Promise((resolve) => {
    const result: { result: string; step: number }[] = [];
    if (trace?.content?.events) {
      const {
        active,
        condition,
        type,
        property = "",
        reference = 0,
      } = data ?? {};
      if (!active) resolve([]);

      const comparator = find(comparators, (c) => c.key === condition);

      try {
        trace.content.events.forEach((event, index) => {
          const isType = !type || type === event.type;
          const match = () =>
            comparator?.apply?.({
              type,
              event,
              property,
              value: get(event, property),
              reference,
              step: index,
              events: trace?.content?.events ?? [],
              node: trees[index],
            });

          if (isType && match()) {
            const needsReference = condition !== "changed";
            result.push({
              step: index,
              result: needsReference
                ? `${property} ${lower(startCase(condition))} ${reference}`
                : `${property} ${lower(startCase(condition))}`,
            });
          }
        });
        // resolve(result);
      } catch (e) {
        resolve({ error: `${e}` });
      }
    }
    resolve(result);
  });
};

const validParentHandler: BreakpointHandler<
  "Valid Parent",
  {
    label: string;
    active: boolean;
  }
> = {
  type: "Valid Parent",
  fields: {
    label: Header,
    active: BreakPointSwitch,
  },
  processor: (data: Partial<Breakpoint>, trace: UploadedTrace) =>
    validParentProcessor(data, trace),
};

const validParentProcessor = async (
  data: Partial<Breakpoint>,
  trace: UploadedTrace
): Promise<{ result: string; step: number }[] | { error: string }> => {
  const { active } = data;
  return new Promise((resolve) => {
    if (!active) resolve([]);
    const violations: { step: number; result: string }[] = [];
    const idSet = new Set();
    forEach(trace.content?.events, (cEvent, step) => {
      idSet.add(cEvent?.id);

      if (!cEvent.pId) return;

      if (!idSet.has(cEvent.pId)) {
        violations.push({
          step,
          result: `Valid Parent: child node ${cEvent.id}'s parent node ${cEvent.pId} is not previously seen`,
        });
      }
    });
    resolve(violations);
  });
};

const monotonicityHandler: BreakpointHandler<
  "Monotonicity",
  {
    active: boolean;
    property: string;
    condition: string;
    label: string;
  }
> = {
  type: "Monotonicity",
  fields: {
    label: Header,
    property: PropertiesSelect,
    condition: (props) =>
      ConditionSelect({ ...props, conditions: ["increase"] }),
    active: BreakPointSwitch,
  },
  processor: (
    data: Partial<Breakpoint>,
    trace: UploadedTrace,
    trees: TreeDict
  ) => monotonicityProcessor(data, trace, trees),
};

const monotonicityProcessor = async (
  data: Partial<Breakpoint>,
  trace: UploadedTrace,
  trees: TreeDict
): Promise<{ result: string; step: number }[] | { error: string }> => {
  const { property, active } = data;
  const propertyValue = property ?? "f";

  return new Promise((resolve) => {
    if (!active) resolve([]);
    const violations: { step: number; result: string }[] = [];
    forEach(trace.content?.events, (cEvent, step) => {
      const cNode = find(trees[step].events, (e) => e.step === step);
      const node = trees[step];
      if (!cNode || !cNode.pId || !node.parent?.events) return;

      let closest = Infinity;

      let pEvent: { data: TraceEvent; step: number; pId: Key; id: Key } =
        {} as any;

      if (cNode.pId != node.parent.id) {
        return;
      }

      map(node.parent.events, (e) => {
        const s = Math.abs(step - e.step);
        if (s < closest && step > e.step) {
          closest = s;
          pEvent = e;
        }
      });

      if (pEvent && pEvent.data?.[propertyValue] > cEvent?.[propertyValue]) {
        violations.push({
          step,
          result: `Monotonicity Violation(${propertyValue}): child node ${cEvent.id} ${propertyValue}-value ${cEvent[propertyValue]} is small than parent node ${pEvent.id}  ${propertyValue}-value ${pEvent.data[propertyValue]}`,
        });
      }
    });

    resolve(violations);
  });
};

const handlersCollection = {
  Breakpoint: breakpointHandler,
  Monotonicity: monotonicityHandler,
  "Valid Parent": validParentHandler,
} as const;

export default handlersCollection satisfies {
  [K in keyof typeof handlersCollection]: BreakpointHandler<K, any>;
};

function lower(arg0: any) {
  throw new Error("Function not implemented.");
}
