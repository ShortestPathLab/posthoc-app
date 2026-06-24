import { useSnackbar } from "components/generic/Snackbar";
import { get } from "es-toolkit/compat";
import memoizee from "memoizee";
import pluralize from "pluralize";
import { useCallback } from "react";
import { useLoadingState } from "slices/loading";
import { endpointSymbol } from "vite-plugin-comlink/symbol";
import { withWorker } from "workers/workerLanes";
import { ParseTraceWorkerParameters, ParseTraceWorkerReturnType } from "./ParseTraceSlaveWorker";

type WorkerModule = typeof import("./parseTrace.worker");

// vite-plugin-comlink rewrites `new ComlinkWorker(...)` into a statement ending
// in `;`, so it MUST sit on its own line (not inside an arrow/expression).
function spawnWorker() {
  const worker = new ComlinkWorker<WorkerModule>(
    new URL("./parseTrace.worker.ts", import.meta.url),
  );
  return worker;
}

const terminate = (w: ReturnType<typeof spawnWorker>) => w[endpointSymbol].terminate();

export const parseTraceAsync = memoizee(
  (params: ParseTraceWorkerParameters): Promise<ParseTraceWorkerReturnType> =>
    withWorker("trace-gen", spawnWorker, terminate, (w) => w.parseTrace(params)),
  { async: true, length: 1 },
);

export function useTraceParser(params: ParseTraceWorkerParameters) {
  const push = useSnackbar();
  const usingLoadingState = useLoadingState("layers");
  return useCallback(
    () =>
      usingLoadingState(async () => {
        if (params?.trace) {
          push("Processing trace...");
          try {
            const output = await parseTraceAsync(params);
            push("Trace loaded", pluralize("step", output?.stepsPersistent?.length ?? 0, true));
            return { components: output, content: params.trace };
          } catch (e) {
            console.error(e);
            push("Error parsing", get(e, "message"));
            return { error: get(e, "message") };
          }
        }
      }),
    [params, usingLoadingState, push],
  );
}
