import { call } from "components/script-editor/call";
import { get, keyBy, toLower as lower, range, startCase } from "lodash";
import memoizee from "memoizee";
import { useTreeMemo } from "pages/TreeWorker";
import { EventTree } from "pages/tree.worker";
import { TraceEvent, TraceEventType } from "protocol";
import { useMemo } from "react";
import { UploadedTrace } from "slices/UIState";
import { useLayer } from "slices/layers";

export type Comparator = {
  key: string;
  apply: (value: number, reference: number) => boolean;
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

type Result = {
  result?: string;
  error?: string;
};

export function useBreakpoints(key?: string) {
  const { layer } = useLayer<DebugLayerData>(key);
  const { monotonicF, monotonicG, breakpoints, code, trace } =
    layer?.source ?? {};
  const { result } = useTreeMemo(
    {
      trace: layer?.source?.trace?.content,
      step: layer?.source?.trace?.content?.events?.length,
      radius: undefined,
    },
    [layer]
  );

  return useMemo(() => {
    const events = trace?.content?.events ?? []; // the actual trace array
    const staticBreakpoints = generateStaticBreakpoints(breakpoints, events);
    const memo = keyBy(events, "id");
    const treeDict = treeToDict(result?.tree ?? []);

    return memoizee((step: number) => {
      const event = events[step];
      if (event) {
        try {
          // Check if step is in staticBreakpoints
          if (staticBreakpoints[step]) {
            return staticBreakpoints[step];
          }
          // Check monotonic f or g values
          if (step) {
            for (const p of [monotonicF && "f", monotonicG && "g"]) {
              if (p && get(memo[`${event.pId}`], p) > get(event, p)) {
                return { result: `Monotonicity violation on ${p}` };
              }
            }
          }
          // Check breakpoints in the breakpoints section
          for (const {
            active,
            condition,
            type,
            property = "",
            reference = 0,
          } of breakpoints ?? []) {
            const isType = !type || type === event.type;

            const match = condition?.apply?.(get(event, property), reference);
            if (condition?.key !== "changed" && active && isType && match) {
              return {
                result: `${property} ${lower(
                  startCase(condition?.key)
                )} ${reference}`,
              };
            }
          }
          // Check breakpoints in the script editor section
          if (
            call(code ?? "", "shouldBreak", [
              step,
              event,
              events,
              treeDict[step]?.parent,
              treeDict[step]?.children,
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
  }, [
    code,
    trace?.content?.events,
    breakpoints,
    monotonicF,
    monotonicG,
    result,
  ]);
}
function generateStaticBreakpoints(
  breakpoints: Breakpoint[] | undefined,
  traces: TraceEvent[]
) {
  function findBreakPoints(
    traces: TraceEvent[],
    property: keyof TraceEvent,
    type: string,
    condition: Comparator
  ) {
    const array: number[] = [];
    let bool = true;
    const dict: { [index: number]: Result } = {};
    // Loop through traces array
    for (const i of range(traces.length)) {
      const isType = !type || type === traces[i].type;
      if (bool && isType) {
        dict[i] = { result: `${property} changed` };
        array.push(i);
        bool = false;
      }
      if (isType && traces[i].type === type) {
        if (
          condition?.apply?.(
            traces[i][property],
            traces[array[array.length - 1]][property]
          )
        ) {
          dict[i] = { result: `${property} changed` };
          array.push(i);
        }
      }
    }
    return dict;
  }
  const combinedDictionary: { [index: number]: Result } = {};

  for (const { active, condition, type = "", property = "" } of breakpoints ??
    []) {
    if (active && condition?.key === "changed") {
      const curDict = findBreakPoints(traces, property, type, condition);
      for (const key in curDict) {
        combinedDictionary[Number(key)] = curDict[key];
      }
    }
  }

  return combinedDictionary;
}
type TreeDict = {
  [K in number]: EventTree;
};
function treeToDict(trees: EventTree[]) {
  const dict: TreeDict = {};

  nodeToDict(trees);

  function nodeToDict(trees: EventTree[] = []) {
    for (const tree of trees) {
      for (const event of tree.events) {
        dict[event.step] = tree;
      }
      nodeToDict(tree.children);
    }
  }
  return dict;
}
