import { useUntrustedLayers } from "components/inspector/useUntrustedLayers";
import { call } from "components/script-editor/call";
import { get, isEqual, toLower as lower, startCase } from "lodash";
import memo from "memoizee";
import { useComputeTree } from "pages/tree/TreeUtility";
import { EventTree } from "pages/tree/treeUtility.worker";
import { TraceEvent, TraceEventType } from "protocol";
import { useMemo } from "react";
import { slice } from "slices";
import { UploadedTrace } from "slices/UIState";
import { Layer } from "slices/layers";

type ApplyOptions = {
  value: number;
  reference: number;
  step: number;
  events: TraceEvent[];
  event: TraceEvent;
  node: EventTree;
  type?: TraceEventType;
  property: string;
};

export type Comparator = {
  key: string;
  apply: (options: ApplyOptions) => boolean;
  needsReference?: boolean;
};

export type Breakpoint = {
  key: string;
  property?: string;
  reference?: number;
  condition?: Comparator;
  active?: boolean;
  type?: TraceEventType;
};

export type DebugLayerData = {
  code?: string;
  breakpoints?: Breakpoint[];
  trace?: UploadedTrace;
};

export function useBreakpoints(key?: string) {
  const one = slice.layers.one<Layer<DebugLayerData>>(key);
  const trace = one.use(
    (c) => c?.source?.trace,
    (a, b) => a?.key === b?.key
  );
  const breakpoints = one.use((c) => c?.source?.breakpoints, isEqual);
  const code = one.use((c) => c?.source?.code);
  const { isTrusted } = useUntrustedLayers();
  const { data: result } = useComputeTree({
    key: trace?.key,
    trace: trace?.content,
    step: trace?.content?.events?.length,
    radius: undefined,
  });

  return useMemo(() => {
    const events = trace?.content?.events ?? []; // the actual trace array
    const trees = treeToDict(result?.tree ?? []);
    return memo((step: number) => {
      const event = events[step];
      if (event) {
        try {
          // Check breakpoints in the breakpoints section
          for (const {
            active,
            condition,
            type,
            property = "",
            reference = 0,
          } of breakpoints ?? []) {
            const isType = !type || type === event.type;

            const match = () =>
              condition?.apply?.({
                type,
                event,
                property,
                value: get(event, property),
                reference,
                step,
                events,
                node: trees[step],
              });
            if (active && isType && match()) {
              return condition?.needsReference
                ? {
                    result: `${property} ${lower(
                      startCase(condition?.key)
                    )} ${reference}`,
                  }
                : {
                    result: `${property} ${lower(startCase(condition?.key))}`,
                  };
            }
          }
          // Check breakpoints in the script editor section
          if (
            isTrusted &&
            call(code ?? "", "shouldBreak", [
              step,
              event,
              events,
              trees[step]?.parent,
              trees[step]?.children ?? [],
            ] as any)
          ) {
            return { result: "Script editor" };
          }
        } catch (e) {
          return { error: `${e}` };
        }
      }
      return { result: "" };
    });
  }, [isTrusted, code, trace, breakpoints, result]);
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
