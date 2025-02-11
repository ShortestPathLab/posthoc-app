import { useEffect, useMemo } from "react";
import { Layer, useLayer } from "slices/layers";
import { chain, forEach, set, values } from "lodash";
import { call } from "components/script-editor/call";
import { EventTree } from "pages/tree/tree.worker";
import { useUntrustedLayers } from "components/inspector/useUntrustedLayers";
import { useTreeMemo } from "pages/tree/TreeWorkerLegacy";
import handlersCollection, {
  BreakpointHandler,
  TreeDict,
} from "components/breakpoint-editor/BreakpointHandlers";
import { Breakpoint } from "components/breakpoint-editor/BreakpointEditor2";
import { UploadedTrace } from "slices/UIState";
import { produce } from "produce";
import objectHash from "object-hash";
import memoizee from "memoizee";

export type DebugLayerData = {
  code?: string;
  monotonicF?: boolean;
  monotonicG?: boolean;
  breakpointInput?: Breakpoint[];
  output: [{ step: number; result: string }[] | { error: string }];
  trace?: UploadedTrace;
};

export function useBreakPoints2(key?: string) {
  const { layer } = useLayer<DebugLayerData>(key);
  const { code = "" } = layer?.source ?? {};
  const { isTrusted } = useUntrustedLayers();
  const events = layer?.source?.trace?.content?.events ?? [];
  const { result: treeRaw } = useTreeMemo(
    {
      trace: layer?.source?.trace?.content,
      step: layer?.source?.trace?.content?.events?.length,
      radius: undefined,
    },
    [layer?.source?.trace?.content]
  );

  const trees = useMemo(() => {
    return treeToDict(treeRaw?.tree ?? []);
  }, [treeRaw]);

  const shouldBreak = useMemo(() => {
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
        call(code, "shouldBreak", [
          step,
          event,
          events,
          trees[step]?.parent,
          trees[step]?.children ?? [],
        ])
      ) {
        return [{ step: step, result: "Script editor" }];
      }

      return steps?.[`${step}`];
    };
  }, [layer, layer?.source?.output, code, isTrusted, events]);

  return {
    shouldBreak,
  };
}

export function BreakpointService({
  layer,
  trees,
  setLayer,
}: {
  layer?: Layer<DebugLayerData>;
  trees: TreeDict;
  setLayer: (layer: Layer<DebugLayerData>) => {};
}) {
  useEffect(() => {
    const processBreakpoint = memoizee(
      async (breakpoint: Breakpoint) => {
        const label = breakpoint.label as keyof typeof handlersCollection;
        const handler = handlersCollection[label] as BreakpointHandler<
          any,
          any
        >;
        const res = await handler.processor(
          breakpoint,
          layer?.source?.trace!,
          trees
        );
        return res;
      },
      { normalizer: ([e]) => objectHash(e) }
    );
    const output: [{ step: number; result: string }[] | { error: string }] =
      [] as any;
    if (layer?.source?.breakpointInput) {
      forEach(layer?.source?.breakpointInput, async (b) => {
        const res = await processBreakpoint(b);
        output.push(res);
      });
    }
    if (layer) {
      setLayer(
        produce(layer, (layer) => set(layer?.source ?? {}, "output", output))
      );
    }
  }, [layer?.key, trees, layer?.source?.breakpointInput]);
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
