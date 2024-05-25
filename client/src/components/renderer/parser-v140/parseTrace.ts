// import "nested-worker/window";
import { useSnackbar } from "components/generic/Snackbar";
import { get } from "lodash";
import pluralize from "pluralize";
import { useMemo } from "react";
import { useLoadingState } from "slices/loading";
import { usingMemoizedWorkerTask } from "workers/usingWorker";
import parseTraceWorkerLegacyUrl from "../parser/parseTrace.worker.ts?worker&url";
import {
  ParseTraceWorkerParameters as ParseTraceWorkerLegacyParameters,
  ParseTraceWorkerReturnType as ParseTraceWorkerLegacyReturnType,
} from "../parser/ParseTraceSlaveWorker";
import parseTraceWorkerUrl from "./parseTrace.worker.ts?worker&url";
import {
  ParseTraceWorkerParameters,
  ParseTraceWorkerReturnType,
} from "./ParseTraceSlaveWorker";

export class ParseTraceWorker extends Worker {
  constructor() {
    super(parseTraceWorkerUrl, { type: "module" });
  }
}
export class ParseTraceWorkerLegacy extends Worker {
  constructor() {
    super(parseTraceWorkerLegacyUrl, { type: "module" });
  }
}

export const parseTraceAsync = usingMemoizedWorkerTask<
  ParseTraceWorkerParameters,
  ParseTraceWorkerReturnType
>(ParseTraceWorker);

export const parseTraceLegacyAsync = usingMemoizedWorkerTask<
  ParseTraceWorkerLegacyParameters,
  ParseTraceWorkerLegacyReturnType
>(ParseTraceWorkerLegacy);

export function useTraceParser(
  params: ParseTraceWorkerParameters | ParseTraceWorkerLegacyParameters,
  deps: any[]
) {
  const push = useSnackbar();
  const usingLoadingState = useLoadingState("specimen");
  return useMemo(() => {
    if (params.trace) {
      return () =>
        usingLoadingState(async () => {
          push("Processing trace...");
          try {
            const output =
              params.trace?.version === "1.4.0"
                ? await parseTraceAsync(params as ParseTraceWorkerParameters)
                : await parseTraceLegacyAsync(
                    params as ParseTraceWorkerLegacyParameters
                  );
            push(
              "Trace loaded",
              pluralize("step", output?.stepsPersistent?.length ?? 0, true)
            );
            return { components: output, content: params.trace };
          } catch (e) {
            console.error(e);
            push("Error parsing", get(e, "message"));
            return { error: get(e, "message") };
          }
        });
    } else {
      return undefined;
    }
  }, deps);
}
