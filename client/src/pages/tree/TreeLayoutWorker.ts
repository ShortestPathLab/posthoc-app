import { useAsync } from "react-async-hook";
import { useMemo } from "react";
import {
  TreeWorkerParameters as TreeLayoutWorkerParameters,
  TreeWorkerReturnType as TreeLayoutWorkerReturnType,
} from "./treeLayout.worker";
import { usingMemoizedWorkerTask } from "workers/usingWorker";
import treeWorkerUrl from "./treeLayout.worker.ts?worker&url";

export class TreeWorkerUrl extends Worker {
  constructor() {
    super(treeWorkerUrl, { type: "module" });
  }
}

export const treeAsync = usingMemoizedWorkerTask<
  TreeLayoutWorkerParameters,
  TreeLayoutWorkerReturnType
>(TreeWorkerUrl);

export function useTreeLayout(trace: TreeLayoutWorkerParameters) {
  return useAsync(async () => await treeAsync(trace), [trace]);
}

export function useTreeLayoutMemo(
  trace: TreeLayoutWorkerParameters,
  deps: unknown[]
) {
  // eslint-disable-next-line react-compiler/react-compiler
  const params = useMemo(() => trace, deps);

  return useTreeLayout(params);
}
