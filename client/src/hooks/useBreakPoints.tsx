import { Breakpoint } from "components/breakpoint-editor/BreakpointEditor";
import { TreeDict } from "components/breakpoint-editor/breakpoints/Breakpoint";
import { map } from "es-toolkit/compat";
import { EventTree } from "pages/tree/treeLayout.worker";
import { useMemo } from "react";
import { slice } from "slices";
import { Layer } from "slices/layers";
import { UploadedTrace } from "slices/UIState";
import { useOne } from "slices/useOne";
export type DebugLayerData = {
  code?: string;
  monotonicF?: boolean;
  monotonicG?: boolean;
  breakpoints?: Breakpoint[];
  breakpointOutput?: Record<string, { step: number; result: string }[] | { error: string }>;
  breakpointOutputDict: Record<string, { step: number; result: string }[]>;
  trace?: UploadedTrace;
};

export function useBreakpoint(key?: string) {
  const one = slice.layers.one<Layer<DebugLayerData>>(key);
  const dict = useOne(one, (l) => l?.source?.breakpointOutputDict);
  return useMemo(() => {
    return {
      shouldBreak: (step: number): { result?: string; error?: string } =>
        dict?.[step]?.length ? { result: map(dict[step], "result").join(", ") } : {},
    };
  }, [dict]);
}


export function treeToDict(trees: EventTree[] = [], dict: TreeDict = {}): TreeDict {
  for (const tree of trees) {
    for (const event of tree.events) {
      dict[event.step] = tree;
    }
    treeToDict(tree.children, dict);
  }
  return dict;
}
