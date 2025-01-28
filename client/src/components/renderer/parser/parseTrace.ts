// import "nested-worker/window";
import { useSnackbar } from "components/generic/Snackbar";
import { get } from "lodash";
import pluralize from "pluralize";
import { useCallback } from "react";
import { useLoadingState } from "slices/loading";
import { usingMemoizedWorkerTask } from "workers/usingWorker";
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

export const parseTraceAsync = usingMemoizedWorkerTask<
  ParseTraceWorkerParameters,
  ParseTraceWorkerReturnType
>(ParseTraceWorker);

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
        }
      }),
    [params]
  );
}
