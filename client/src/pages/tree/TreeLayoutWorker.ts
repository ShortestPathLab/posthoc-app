import { useQuery } from "@tanstack/react-query";
import { usingMemoizedWorkerTask } from "workers/usingWorker";
import {
  TreeWorkerParameters as TreeLayoutWorkerParameters,
  TreeWorkerReturnType as TreeLayoutWorkerReturnType,
} from "./treeLayout.worker";

export const TreeLayoutWorker = () =>
  new Worker("./treeLayout.worker.ts", { type: "module" });

export const treeAsync = usingMemoizedWorkerTask<
  TreeLayoutWorkerParameters,
  TreeLayoutWorkerReturnType
>(TreeLayoutWorker);

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
