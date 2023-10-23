import pluralize from "pluralize";
import { useAsync } from "react-async-hook";
import { useMemo } from "react";
import {
  ParseTraceWorkerParameters,
  ParseTraceWorkerReturnType,
} from "./parseTrace.worker";
import { useSnackbar } from "components/generic/Snackbar";
import { useLoadingState } from "slices/loading";
import { usingMemoizedWorkerTask } from "workers/usingWorker";
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

export function useTrace(params: ParseTraceWorkerParameters) {
  const push = useSnackbar();
  const usingLoadingState = useLoadingState("specimen");
  return useAsync(
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

export function useTraceMemo(trace: ParseTraceWorkerParameters, deps: any[]) {
  const params = useMemo(() => trace, deps);
  return useTrace(params);
}
