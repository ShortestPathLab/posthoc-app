import { useQuery } from "@tanstack/react-query";
import { usingMemoizedWorkerTask } from "../../workers/usingWorker";
import {
  TreeWorkerParameters,
  TreeWorkerReturnType,
} from "./treeLegacy.worker";
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

export function useTreeMemo({
  key,
  radius,
  step,
  trace,
}: TreeWorkerParameters & { key?: string }) {
  return useQuery({
    queryKey: ["compute/tree", key, radius, step],
    queryFn: async () => await treeAsync({ radius, step, trace }),
    enabled: !!key,
    staleTime: Infinity,
  });
}
