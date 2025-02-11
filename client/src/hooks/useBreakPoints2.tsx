import { Breakpoint } from "components/breakpoint-editor/BreakpointEditor2";
import handlersCollection, {
  BreakpointHandler,
  TreeDict,
} from "components/breakpoint-editor/BreakpointHandlers";
import { useUntrustedLayers } from "components/inspector/useUntrustedLayers";
import { call } from "components/script-editor/call";
import { chain, forEach, isEqual, values } from "lodash";
import memoizee from "memoizee";
import objectHash from "object-hash";
import { EventTree } from "pages/tree/treeLayout.worker";
import { useComputeTree } from "pages/tree/TreeWorkerLegacy";
import { useEffect, useMemo } from "react";
import { slice } from "slices";
import { Layer } from "slices/layers";
import { equal } from "slices/selector";
import { UploadedTrace } from "slices/UIState";
import { set } from "utils/set";

export type DebugLayerData = {
  code?: string;
  monotonicF?: boolean;
  monotonicG?: boolean;
  breakpointInput?: Breakpoint[];
  output: [{ step: number; result: string }[] | { error: string }];
  trace?: UploadedTrace;
};

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
      chain(layer?.source?.output)
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
  }, [layer, layer?.source?.output, code, isTrusted, events]);

  return {
    shouldBreak,
  };
}

export function BreakpointService({ value }: { value?: string }) {
  "use no memo";

  const one = slice.layers.one<Layer<DebugLayerData>>(value);

  const trace = one.use<UploadedTrace | undefined>(
    (l) => l?.source?.trace,
    equal("key")
  );

  const inputs = one.use((l) => l?.source?.breakpointInput, isEqual);

  const { data: { dict, tree } = {} } = useComputeTree({
    key: trace?.key,
    trace: trace?.content,
    step: trace?.content?.events?.length,
    radius: undefined,
  });

  useEffect(() => {
    if (!dict || !tree || !trace) return;
    const processBreakpoint = memoizee(
      async (breakpoint: Breakpoint) => {
        const label = breakpoint.label as keyof typeof handlersCollection;
        const handler = handlersCollection[label] as BreakpointHandler<
          any,
          any
        >;
        const res = await handler.processor(breakpoint, trace, dict);
        return res;
      },
      { normalizer: ([e]) => objectHash(e) }
    );
    const output: [{ step: number; result: string }[] | { error: string }] =
      [] as any;
    if (inputs) {
      forEach(inputs, async (b) => {
        const res = await processBreakpoint(b);
        output.push(res);
      });

      one.set((l) => set(l, "source.output", output));
    }
  }, [dict, inputs]);
  return <></>;
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
