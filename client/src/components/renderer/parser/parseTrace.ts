import { useSnackbar } from "components/generic/Snackbar";
import pluralize from "pluralize";
import { useMemo } from "react";
import { useAsync } from "react-async-hook";
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

export function useTrace(params: ParseTraceWorkerParameters) {
  const push = useSnackbar();
  const usingLoadingState = useLoadingState("specimen");
  return useAsync(
    () =>
      usingLoadingState(async () => {
        if (params?.trace) {
          push("Processing trace...");
          const output = await parseTraceAsync(params);
          push(
            "Trace loaded",
            pluralize("step", output?.steps?.length ?? 0, true)
          );
          return output;
        }
      }),
    [params]
  );
}

export function useTraceMemo(trace: ParseTraceWorkerParameters, deps: any[]) {
  const params = useMemo(() => trace, deps);
  return useTrace(params);
}
