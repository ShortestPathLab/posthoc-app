import { call } from "components/script-editor/call";
import { get, toLower as lower, startCase } from "lodash";
import memo from "memoizee";
import { useTreeMemo } from "pages/TreeWorker";
import { EventTree } from "pages/tree.worker";
import { TraceEvent, TraceEventType } from "protocol";
import { useMemo } from "react";
import { UploadedTrace } from "slices/UIState";
import { useLayer } from "slices/layers";

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
  monotonicF?: boolean;
  monotonicG?: boolean;
  breakpoints?: Breakpoint[];
  trace?: UploadedTrace;
};

export function useBreakpoints(key?: string) {
  const { layer } = useLayer<DebugLayerData>(key);
  const { monotonicF, monotonicG, breakpoints, code, trace } =
    layer?.source ?? {};
  const content = trace?.content;
  const { result } = useTreeMemo(
    {
      trace: content,
      step: content?.events?.length,
      radius: undefined,
    },
    [content]
  );

  return useMemo(() => {
    const events = content?.events ?? []; // the actual trace array
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
                event: event,
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
            call(code ?? "", "shouldBreak", [
              step,
              event,
              events,
              trees[step]?.parent,
              trees[step]?.children,
            ])
          ) {
            return { result: "Script editor" };
          }
        } catch (e) {
          return { error: `${e}` };
        }
      }
      return { result: "" };
    });
  }, [code, content, breakpoints, monotonicF, monotonicG, result]);
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
