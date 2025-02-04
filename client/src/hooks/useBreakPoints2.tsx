import {
  BreakPointSwitch,
  ConditionSelect,
  EventSelect,
  PropertiesSelect,
  ReferenceInput,
} from "components/breakpoint-editor/BreakPointFields";
import { ComponentType, useMemo } from "react";
import memo from "memoizee";
import { useLayer } from "slices/layers";
import {
  find,
  get,
  map,
  startCase,
  toLower as lower,
  filter,
  chain,
  isUndefined,
} from "lodash";
import { Breakpoint } from "components/breakpoint-editor/BreakPointEditor2";
import { UploadedTrace } from "slices/UIState";
import { comparators } from "components/breakpoint-editor/comparators";
import { useTreeMemo } from "pages/tree/TreeWorkerLegacy";
import { EventTree } from "pages/tree/tree.worker";
import { makePathIndex, Node } from "layers/trace/makePathIndex";
import { TraceEvent } from "protocol";
import { L } from "vitest/dist/chunks/reporters.D7Jzd9GS";

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
  trace: UploadedTrace
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

export type DebugLayerData = {
  code?: string;
  monotonicF?: boolean;
  monotonicG?: boolean;
  breakpoints?: Breakpoint[];
  output?: { [key: string]: { step?: number; result?: string }[] };
  trace?: UploadedTrace;
};

export function useBreakPoints2(key?: string) {
  const { layer, setLayer } = useLayer<DebugLayerData>(key);
  const events = layer?.source?.trace?.content?.events;
  const { result: treeRaw } = useTreeMemo(
    {
      trace: layer?.source?.trace?.content,
      step: events?.length,
      radius: undefined,
    },
    [layer?.source?.trace?.content]
  );
  const trees = treeToDict(treeRaw?.tree ?? []);

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
    processor: (data: Partial<Breakpoint>, trace: UploadedTrace) =>
      breakPointProcessor(data, trace),
  };

  const monotonicityHandler: BreakpointHandler<
    "Monotonicity",
    {
      active: boolean;
      property: string;
      condition: string;
    }
  > = {
    type: "Monotonicity",
    fields: {
      property: PropertiesSelect,
      condition: (props) =>
        ConditionSelect({ ...props, conditions: ["increase"] }),
      active: BreakPointSwitch,
    },
    processor: (data: Partial<Breakpoint>, trace: UploadedTrace) =>
      monotonicityProcessor(data, trace),
  };

  const validParentHandler: BreakpointHandler<
    "Valid Parent",
    {
      active: boolean;
      reference: number;
    }
  > = {
    type: "Valid Parent",
    fields: {
      reference: ReferenceInput,
      active: BreakPointSwitch,
    },
    processor: (data: Partial<Breakpoint>, trace: UploadedTrace) =>
      validParentProcessor(data, trace),
  };

  const handlersCollection = {
    Breakpoint: breakpointHandler,
    Monotonicity: monotonicityHandler,
    "Valid Parent": validParentHandler,
  } as const;

  const breakPointProcessor = async (
    data: Partial<Breakpoint>,
    trace: UploadedTrace
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

            if (active && isType && match()) {
              const needsReference = condition !== "changed";

              result.push({
                result: needsReference
                  ? `${property} ${lower(startCase(condition))} ${reference}`
                  : `${property} ${lower(startCase(condition))}`,
                step: index,
              });
            }
            // Check breakpoints in the script editor section
            // if (
            //   isTrusted &&
            //   call(code ?? "", "shouldBreak", [
            //     step,
            //     event,
            //     events,
            //     trees[step]?.parent,
            //     trees[step]?.children ?? [],
            //   ])
            // ) {
            //   return { result: "Script editor" };
            // }
          });
          // resolve(result);
        } catch (e) {
          resolve({ error: `${e}` });
        }
      }
      resolve(result);
    });
  };

  const monotonicityProcessor = async (
    data: Partial<Breakpoint>,
    trace: UploadedTrace
  ): Promise<{ result: string; step: number }[] | { error: string }> => {
    const { property } = data;
    const propertyValue = property ?? "f";

    const groupedTraceBypId = chain(trace?.content?.events)
      .map((c, i) => ({ step: i, ...c }))
      .groupBy("pId")
      .value();

    const TraveseSubtree = (
      root: TraceEvent,
      check: (
        children: TraceEvent[],
        root: TraceEvent
      ) => { step: number; result: string }[],
      visited = new Set<number | string>(),
      result?: any[]
    ): void => {
      if (visited.has(root.id)) {
        return;
      }
      visited.add(root.id);

      const children = groupedTraceBypId[root.id];
      if (!children || children.length < 1) return;

      const currentResult = check(children, root);

      if (currentResult.length > 0 && result) {
        result.push(...currentResult);
      }

      children.forEach((child) => {
        TraveseSubtree(child, check, visited, result);
      });
    };

    const check = (
      children: TraceEvent[],
      root: TraceEvent
    ): { step: number; result: string }[] => {
      return children.reduce((violations, child) => {
        if (
          !isUndefined(child[propertyValue]) &&
          !isUndefined(root[propertyValue])
        ) {
          if (
            !isUndefined(child[propertyValue]) &&
            !isUndefined(root[propertyValue]) &&
            child[propertyValue] < root[propertyValue]
          ) {
            violations.push({
              step: child.step,
              result: `Monotonicity Violation(${propertyValue}): child node ${child.id} f-value ${child.f} is small than root ${root.id} f-value ${root.f}`,
            });
          }
        }
        return violations;
      }, [] as { step: number; result: string }[]);
    };

    return new Promise((resolve) => {
      const violations: { step: number; result: string }[] = [];
      if (trace?.content?.events) {
        TraveseSubtree(
          trace?.content?.events?.[0],
          check,
          new Set(),
          violations
        );
      }
      resolve(violations);
    });
  };

  const validParentProcessor = async (
    data: Partial<Breakpoint>,
    trace: UploadedTrace
  ): Promise<{ result: string; step: number }[] | { error: string }> => {
    return new Promise(() => {});
  };

  function shouldBreak() {
    return useMemo(() => {
      const breakPoints: { step?: number; result?: string }[] = Object.values(
        layer?.source?.output?.[0] ?? {}
      ).flat();

      return memo((step: number) => {
        return filter(
          breakPoints,
          (b: { step?: number; result?: string }) => b.step === step
        );
      });
    }, [layer?.source?.output]);
  }

  return {
    handlersCollection: handlersCollection satisfies {
      [K in keyof typeof handlersCollection]: BreakpointHandler<K, any>;
    },
    shouldBreak,
  };
}

type TreeDict = {
  [K in number]: EventTree;
};

function treeToDict(trees: EventTree[] = [], dict: TreeDict = {}) {
  for (const tree of trees) {
    for (const event of tree.events) {
      dict[event.step] = tree;
    }
    treeToDict(tree.children, dict);
  }
  return dict;
}
