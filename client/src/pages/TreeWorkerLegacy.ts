import { useAsync } from "react-async-hook";
import { useMemo } from "react";
import {
  TreeWorkerParameters,
  TreeWorkerReturnType,
} from "./treeLegacy.worker";
import { usingMemoizedWorkerTask } from "../workers/usingWorker";
import treeWorkerUrl from "./treeLegacy.worker.ts?worker&url";

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
