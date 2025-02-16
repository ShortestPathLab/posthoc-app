import { Breakpoint } from "components/breakpoint-editor/BreakpointEditor";
import { TreeDict } from "components/breakpoint-editor/breakpoints/Breakpoint";
import { useUntrustedLayers } from "components/inspector/useUntrustedLayers";
import { call } from "components/script-editor/call";
import { chain, map, values } from "lodash";
import { EventTree } from "pages/tree/treeLayout.worker";
import { useComputeTree } from "pages/tree/TreeUtility";
import { useMemo } from "react";
import { slice } from "slices";
import { Layer } from "slices/layers";
import { UploadedTrace } from "slices/UIState";

export type DebugLayerData = {
  code?: string;
  monotonicF?: boolean;
  monotonicG?: boolean;
  breakpoints?: Breakpoint[];
  breakpointOutput?: Record<
    string,
    { step: number; result: string }[] | { error: string }
  >;
  breakpointOutputDict: Record<string, { step: number; result: string }[]>;
  trace?: UploadedTrace;
};

export function useBreakpoint3(key?: string) {
  "use no memo";
  const one = slice.layers.one<Layer<DebugLayerData>>(key);
  const dict = one.use((l) => l?.source?.breakpointOutputDict);
  return useMemo(() => {
    return {
      shouldBreak: (step: number): { result?: string; error?: string } =>
        dict?.[step]?.length
          ? { result: map(dict[step], "result").join(", ") }
          : {},
    };
  }, [dict]);
}

export function useBreakPoints2(key?: string) {
  "use no memo";

  const layer = slice.layers.one<Layer<DebugLayerData>>(key).use();
  const { code = "" } = layer?.source ?? {};
  const { isTrusted } = useUntrustedLayers();
  const events = layer?.source?.trace?.content?.events ?? [];
  const { data: { dict } = {} } = useComputeTree({
    trace: layer?.source?.trace?.content,
    step: layer?.source?.trace?.content?.events?.length,
    radius: undefined,
  });

  const shouldBreak = useMemo(() => {
    if (!dict) return;
    const steps =
      chain(layer?.source?.breakpointOutput)
        .map((s) => values(s))
        .flattenDepth(2)
        .groupBy("step")
        .value() ?? [];

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
  }, [layer, layer?.source?.breakpointOutput, code, isTrusted, events]);

  return {
    shouldBreak,
  };
}

export function treeToDict(
  trees: EventTree[] = [],
  dict: TreeDict = {}
): TreeDict {
  for (const tree of trees) {
    for (const event of tree.events) {
      dict[event.step] = tree;
    }
    treeToDict(tree.children, dict);
  }
  return dict;
}
