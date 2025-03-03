import { Breakpoint } from "components/breakpoint-editor/BreakpointEditor";
import {
  BreakpointProcessorOutput,
  TreeDict,
} from "components/breakpoint-editor/breakpoints/Breakpoint";
import { DebugLayerData } from "hooks/useBreakPoints";
import { groupBy, isEqual, values } from "lodash-es";
import memo from "memoizee";
import objectHash from "object-hash";
import { useComputeTree } from "pages/tree/TreeUtility";
import { useEffect } from "react";
import { useAsyncAbortable } from "react-async-hook";
import { slice } from "slices";
import { Layer } from "slices/layers";
import { useLoadingState } from "slices/loading";
import { equal } from "slices/selector";
import { UploadedTrace } from "slices/UIState";
import { NonEmptyString } from "utils/Char";
import { set } from "utils/set";
import { usingWorkerTask } from "workers/usingWorker";
import workerUrl from "./breakpoint.worker.ts?worker&url";
import { _ } from "utils/chain";
async function attempt<T, U>(
  f: () => Promise<T>,
  c: (e: unknown) => U
): Promise<T | U> {
  try {
    return await f();
  } catch (e) {
    return c(e);
  }
}

export type BreakpointWorkerParameters = {
  breakpoint: Breakpoint;
  trace: UploadedTrace;
  dict: TreeDict;
};

export class BreakpointWorker extends Worker {
  constructor() {
    super(workerUrl, { type: "module" });
  }
}

export const processBreakpointAsync = usingWorkerTask<
  BreakpointWorkerParameters,
  BreakpointProcessorOutput
>(BreakpointWorker);

const processBreakpoint = memo(
  (breakpoint, key, trace, tree, dict) =>
    processBreakpointAsync({ breakpoint, trace, dict }),
  {
    normalizer: ([a, b]) => objectHash({ breakpoint: a, key: b }),
    primitive: true,
  }
);

export function BreakpointService({ value }: { value?: string }) {
  "use no memo";

  const one = slice.layers.one<Layer<DebugLayerData>>(value);

  const usingLoadingState = useLoadingState("general");

  const trace = one.use<UploadedTrace | undefined>(
    (l) => l?.source?.trace,
    equal("key")
  );

  const inputs = one.use((l) => l?.source?.breakpoints, isEqual);

  const { data: { dict, tree } = {} } = useComputeTree({
    key: trace?.key,
    trace: trace?.content,
    step: trace?.content?.events?.length,
    radius: undefined,
  });

  useAsyncAbortable(
    (signal) =>
      usingLoadingState(async () => {
        if (!dict || !tree || !trace || !trace.key) return;
        for (const breakpoint of inputs ?? []) {
          if (breakpoint.active) {
            const res = await attempt(
              () => processBreakpoint(breakpoint, trace.key, trace, tree, dict),
              (e) => ({ error: `${e}` })
            );
            if (signal.aborted) return;
            one.set(
              (l) =>
                void set(
                  l,
                  `source.breakpointOutput.${breakpoint.key as NonEmptyString}`,
                  res
                )
            );
          } else {
            one.set(
              (l) =>
                void set(
                  l,
                  `source.breakpointOutput.${breakpoint.key as NonEmptyString}`,
                  []
                )
            );
          }
        }
      }),
    [dict, tree, inputs, value]
  );

  const outputs = one.use((l) => l?.source?.breakpointOutput, isEqual);

  useEffect(() => {
    one.set(
      (l) =>
        void set(
          l,
          "source.breakpointOutputDict",
          _(
            outputs,
            values,
            (s) =>
              s.flatMap((v) => {
                return "error" in v ? [] : v;
              }),
            (s) => groupBy(s, "step")
          )
        )
    );
  }, [outputs]);

  return <></>;
}
