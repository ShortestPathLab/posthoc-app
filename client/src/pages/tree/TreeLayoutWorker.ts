import { useQuery } from "@tanstack/react-query";
import { usingMemoizedWorkerTask } from "workers/usingWorker";
import {
  TreeWorkerParameters as TreeLayoutWorkerParameters,
  TreeWorkerReturnType as TreeLayoutWorkerReturnType,
} from "./treeLayout.worker";
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

export function useTreeLayout({
  key,
  mode,
  orientation,
  step,
  trace,
}: TreeLayoutWorkerParameters & { key?: string }) {
  return useQuery({
    queryKey: ["compute/tree/layout", key, mode, orientation, step],
    queryFn: () => treeAsync({ mode, orientation, step, trace }),
    enabled: !!key,
    staleTime: Infinity,
  });
}
