import { Breakpoint } from "components/breakpoint-editor/BreakpointEditor";
import { TreeDict } from "components/breakpoint-editor/breakpoints/Breakpoint";
import { useUntrustedLayers } from "components/inspector/useUntrustedLayers";
import { call } from "components/script-editor/call";
import { flattenDepth, groupBy, map, values } from "es-toolkit/compat";
import { EventTree } from "pages/tree/treeLayout.worker";
import { useComputeTree } from "pages/tree/TreeUtility";
import { useMemo } from "react";
import { slice } from "slices";
import { Layer } from "slices/layers";
import { UploadedTrace } from "slices/UIState";
import { useOne } from "slices/useOne";
import { flow } from "utils/flow";
export type DebugLayerData = {
  code?: string;
  monotonicF?: boolean;
  monotonicG?: boolean;
  breakpoints?: Breakpoint[];
  breakpointOutput?: Record<string, { step: number; result: string }[] | { error: string }>;
  breakpointOutputDict: Record<string, { step: number; result: string }[]>;
  trace?: UploadedTrace;
};

export function useBreakpoint3(key?: string) {
  const one = slice.layers.one<Layer<DebugLayerData>>(key);
  const dict = useOne(one, (l) => l?.source?.breakpointOutputDict);
  return useMemo(() => {
    return {
      shouldBreak: (step: number): { result?: string; error?: string } =>
        dict?.[step]?.length ? { result: map(dict[step], "result").join(", ") } : {},
    };
  }, [dict]);
}

export function useBreakPoints2(key?: string) {
  const layer = useOne(slice.layers.one<Layer<DebugLayerData>>(key));
  // Defaults pulled out of destructures to avoid a React Compiler bailout.
  const code = layer?.source?.code ?? "";
  const { isTrusted } = useUntrustedLayers();
  const events = useMemo(
    () => layer?.source?.trace?.content?.events ?? [],
    [layer?.source?.trace?.content?.events],
  );
  const { data } = useComputeTree({
    trace: layer?.source?.trace?.content,
    step: layer?.source?.trace?.content?.events?.length,
    radius: undefined,
  });
  const { dict } = data ?? {};

  const shouldBreak = useMemo(() => {
    if (!dict) return;
    const steps = flow(
      layer?.source?.breakpointOutput,
      (b) => map(b, (s) => values(s)),
      (b) => flattenDepth(b, 2),
      (b) => groupBy(b, "step"),
    );

    return (step: number) => {
      const event = events[step];
      if (
        code &&
        isTrusted &&
        //TODO: Fix type
        call(code, "shouldBreak", [
          step,
          event,
          events,
          dict[step]?.parent,
          dict[step]?.children ?? [],
        ] as unknown as any)
      ) {
        return [{ step, result: "Script editor" }];
      }

      return steps?.[`${step}`];
    };
  }, [layer, code, isTrusted, events, dict]);

  return {
    shouldBreak,
  };
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
