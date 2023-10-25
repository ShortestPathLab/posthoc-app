import { useSnackbar } from "components/generic/Snackbar";
import pluralize from "pluralize";
import { useCallback } from "react";
import { useLoadingState } from "slices/loading";
import { usingMemoizedWorkerTask } from "workers/usingWorker";
import {
  ParseTraceWorkerParameters,
  ParseTraceWorkerReturnType,
} from "./parseTrace.worker";
import parseGridWorkerUrl from "./parseTrace.worker.ts?worker&url";

export class ParseTraceWorker extends Worker {
  constructor() {
    super(parseGridWorkerUrl, { type: "module" });
  }
}

export const parseTraceAsync = usingMemoizedWorkerTask<
  ParseTraceWorkerParameters,
  ParseTraceWorkerReturnType
>(ParseTraceWorker);

export function useTraceParser(params: ParseTraceWorkerParameters) {
  const push = useSnackbar();
  const usingLoadingState = useLoadingState("specimen");
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
            return output;
          } catch (e) {
            push("Error parsing", `${e}`);
          }
        }
      }),
    [params]
  );
}
