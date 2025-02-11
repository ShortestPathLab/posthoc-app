import { useQuery } from "@tanstack/react-query";
import { treeToDict } from "hooks/useBreakPoints2";
import { usingMemoizedWorkerTask } from "workers/usingWorker";
import {
  TreeWorkerParameters,
  TreeWorkerReturnType,
} from "./treeUtility.worker";
import treeWorkerUrl from "./treeUtility.worker.ts?worker&url";

export class TreeWorkerUrl extends Worker {
  constructor() {
    super(treeWorkerUrl, { type: "module" });
  }
}

export const treeAsync = usingMemoizedWorkerTask<
  TreeWorkerParameters,
  TreeWorkerReturnType
>(TreeWorkerUrl);

export function useComputeTree({
  key,
  radius,
  step,
  trace,
}: TreeWorkerParameters & { key?: string }) {
  return useQuery({
    queryKey: ["compute/tree/utility", key, radius, step],
    queryFn: async () => {
      const tree = await treeAsync({ radius, step, trace });
      if (tree) {
        const dict = treeToDict(tree?.tree ?? []);
        return { dict, ...tree };
      }
    },
    enabled: !!key,
    staleTime: Infinity,
  });
}
