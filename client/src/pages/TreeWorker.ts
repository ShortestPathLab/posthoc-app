import { useMemo } from "react";
import { useAsync } from "react-async-hook";
import { usingMemoizedWorkerTask } from "workers/usingWorker";
import { TreeWorkerParameters, TreeWorkerReturnType } from "./tree.worker";
import treeWorkerUrl from "./tree.worker.ts?worker&url";

export class TreeWorkerUrl extends Worker {
  constructor() {
    super(treeWorkerUrl, { type: "module" });
  }
}

export const treeAsync = usingMemoizedWorkerTask<
  TreeWorkerParameters,
  TreeWorkerReturnType
>(TreeWorkerUrl);

export function useTree(trace: TreeWorkerParameters) {
  return useAsync(async () => await treeAsync(trace), [trace]);
}

export function useTreeMemo(trace: TreeWorkerParameters, deps: any[]) {
  const params = useMemo(() => trace, deps);
  return useTree(params);
}
