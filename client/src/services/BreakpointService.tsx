import { queryOptions, useQueries } from "@tanstack/react-query";
import { Breakpoint } from "components/breakpoint-editor/BreakpointEditor";
import {
  BreakpointProcessorOutput,
  TreeDict,
} from "components/breakpoint-editor/breakpoints/Breakpoint";
import { isEqual } from "es-toolkit";
import { groupBy, values } from "es-toolkit/compat";
import { DebugLayerData } from "hooks/useBreakPoints";
import { useComputeTree } from "pages/tree/TreeUtility";
import { useEffect, useMemo } from "react";
import { slice } from "slices";
import { Layer } from "slices/layers";
import { loading } from "slices/loading";
import { id } from "slices/selector";
import { UploadedTrace } from "slices/UIState";
import { useOne } from "slices/useOne";
import { NonEmptyString } from "utils/Char";
import { flow } from "utils/flow";
import { set } from "utils/set";
import { endpointSymbol } from "vite-plugin-comlink/symbol";
import { withWorker } from "workers/workerLanes";

type WorkerModule = typeof import("./breakpoint.worker");

// vite-plugin-comlink rewrites `new ComlinkWorker(...)` into a statement ending
// in `;`, so it MUST sit on its own line (not inside an arrow/expression).
function spawnWorker() {
  const worker = new ComlinkWorker<WorkerModule>(
    new URL("./breakpoint.worker.ts", import.meta.url),
  );
  return worker;
}

const terminate = (w: ReturnType<typeof spawnWorker>) => w[endpointSymbol].terminate();

export type BreakpointWorkerParameters = {
  breakpoint: Breakpoint;
  trace: UploadedTrace;
  dict: TreeDict;
};

/** Raw, lane-routed, cancellable worker call. */
const runBreakpoint = (
  params: BreakpointWorkerParameters,
  signal?: AbortSignal,
): BreakpointProcessorOutput =>
  withWorker("breakpoint", spawnWorker, terminate, (w): BreakpointProcessorOutput => w.run(params), {
    signal,
  });

export type BreakpointOutput = Awaited<BreakpointProcessorOutput> | { error: string };

export type BreakpointQueryOptions = {
  breakpoint: Breakpoint;
  /** Trace key — the lightweight cache identity (with the breakpoint). */
  key?: string;
  trace?: UploadedTrace;
  dict?: TreeDict;
  enabled?: boolean;
};

/**
 * One breakpoint's output. Keyed by the trace key + breakpoint (the heavy
 * trace/dict payloads derive from the key), run through the `breakpoint` lane
 * with React Query's `signal` for cancellation. Errors are captured as
 * `{ error }` so the layer can render them.
 */
export const breakpointQuery = ({
  breakpoint,
  key,
  trace,
  dict,
  enabled = true,
}: BreakpointQueryOptions) =>
  queryOptions({
    queryKey: ["compute/breakpoint", key, breakpoint],
    queryFn: async ({ signal }): Promise<BreakpointOutput> => {
      try {
        return await runBreakpoint({ breakpoint, trace: trace!, dict: dict! }, signal);
      } catch (e) {
        return { error: `${e}` };
      }
    },
    enabled: enabled && !!key && !!trace && !!dict,
    staleTime: Infinity,
  });

export function BreakpointService({ value }: { value?: string }) {
  const one = useMemo(() => slice.layers.one<Layer<DebugLayerData>>(value), [value]);

  const trace = useOne(one, (l) => l?.source?.trace, id("key"));

  const inputs = useOne(one, (l) => l?.source?.breakpoints, isEqual);

  const { data } = useComputeTree({
    key: trace?.key,
    trace: trace?.content,
    step: trace?.content?.events?.length,
    radius: undefined,
  });
  const { dict } = data ?? {};
  const ready = !!data && !!trace?.key;

  const breakpoints = useMemo(() => inputs ?? [], [inputs]);

  // One query per breakpoint; active ones run, inactive ones stay disabled.
  const results = useQueries({
    queries: breakpoints.map((breakpoint) =>
      breakpointQuery({
        breakpoint,
        key: trace?.key,
        trace,
        dict,
        enabled: ready && breakpoint.active,
      }),
    ),
  });

  // Mirror in-flight breakpoint work into the global "general" loading counter.
  const anyFetching = results.some((r) => r.isFetching);
  useEffect(() => {
    if (!anyFetching) return;
    loading.start("general");
    return () => loading.end("general");
  }, [anyFetching]);

  // Commit settled outputs to the layer (inactive → []; loading → omitted, so
  // results fill in incrementally), guarding redundant writes.
  useEffect(() => {
    if (!ready) return;
    const output: Record<string, BreakpointOutput> = {};
    breakpoints.forEach((breakpoint, i) => {
      const k = breakpoint.key as NonEmptyString;
      const d = results[i]?.data;
      if (!breakpoint.active) output[k] = [];
      else if (d !== undefined) output[k] = d;
    });
    if (!isEqual(one.get()?.source?.breakpointOutput, output)) {
      one.set((l) => void set(l, "source.breakpointOutput", output));
    }
  }, [ready, breakpoints, results, one]);

  const outputs = useOne(one, (l) => l?.source?.breakpointOutput, isEqual);

  useEffect(() => {
    one.set(
      (l) =>
        void set(
          l,
          "source.breakpointOutputDict",
          flow(
            outputs,
            values,
            (s) =>
              s.flatMap((v) => {
                return "error" in v ? [] : v;
              }),
            (s) => groupBy(s, "step"),
          ),
        ),
    );
  }, [outputs, one]);

  return <></>;
}
