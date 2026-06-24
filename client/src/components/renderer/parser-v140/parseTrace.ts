import { useSnackbar } from "components/generic/Snackbar";
import { get } from "es-toolkit/compat";
import memoizee from "memoizee";
import pluralize from "pluralize";
import { useMemo } from "react";
import { useLoadingState } from "slices/loading";
import { endpointSymbol } from "vite-plugin-comlink/symbol";
import { withWorker } from "workers/workerLanes";
import {
  ParseTraceWorkerParameters as ParseTraceWorkerLegacyParameters,
  ParseTraceWorkerReturnType as ParseTraceWorkerLegacyReturnType,
} from "../parser/ParseTraceSlaveWorker";
import { ParseTraceWorkerParameters, ParseTraceWorkerReturnType } from "./ParseTraceSlaveWorker";

type WorkerModule = typeof import("./parseTrace.worker");
type LegacyWorkerModule = typeof import("../parser/parseTrace.worker");

// vite-plugin-comlink rewrites `new ComlinkWorker(...)` into a statement ending
// in `;`, so each MUST sit on its own line (not inside an arrow/expression).
function spawnWorker() {
  const worker = new ComlinkWorker<WorkerModule>(
    new URL("./parseTrace.worker.ts", import.meta.url),
  );
  return worker;
}

function spawnLegacyWorker() {
  const worker = new ComlinkWorker<LegacyWorkerModule>(
    new URL("../parser/parseTrace.worker.ts", import.meta.url),
  );
  return worker;
}

const terminate = (w: { [endpointSymbol]: Worker }) => w[endpointSymbol].terminate();

export const parseTraceAsync = memoizee(
  (params: ParseTraceWorkerParameters): Promise<ParseTraceWorkerReturnType> =>
    withWorker("trace-gen", spawnWorker, terminate, (w) => w.parseTrace(params)),
  { async: true, length: 1 },
);

export const parseTraceLegacyAsync = memoizee(
  (params: ParseTraceWorkerLegacyParameters): Promise<ParseTraceWorkerLegacyReturnType> =>
    withWorker("trace-gen", spawnLegacyWorker, terminate, (w) => w.parseTrace(params)),
  { async: true, length: 1 },
);

export function useTraceParser(
  params: ParseTraceWorkerParameters | ParseTraceWorkerLegacyParameters,
  trusted: boolean,
  deps: any[],
) {
  const push = useSnackbar();
  const usingLoadingState = useLoadingState("layers");
  return useMemo(() => {
    if (params.trace) {
      return trusted
        ? () =>
            usingLoadingState(async () => {
              push("Processing trace...");
              try {
                const output =
                  params.trace?.version === "1.4.0"
                    ? await parseTraceAsync(params as ParseTraceWorkerParameters)
                    : await parseTraceLegacyAsync(params as ParseTraceWorkerLegacyParameters);
                push("Trace loaded", pluralize("step", output?.stepsPersistent?.length ?? 0, true));
                return { components: output, content: params.trace };
              } catch (e) {
                console.error(e);
                push("Error parsing", get(e, "message"));
                return { error: get(e, "message") };
              }
            })
        : () =>
            usingLoadingState(async () => {
              push("Trace loaded", pluralize("step", params.trace?.events?.length ?? 0, true));
              return {
                content: params.trace,
                components: {
                  stepsPersistent: [],
                  stepsTransient: [],
                },
              };
            });
    } else {
      return undefined;
    }
    // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
  }, deps);
}
