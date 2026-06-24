import { useQuery } from "@tanstack/react-query";
import memoizee from "memoizee";
import { endpointSymbol } from "vite-plugin-comlink/symbol";
import { withWorker } from "workers/workerLanes";
import {
  TreeWorkerParameters as TreeLayoutWorkerParameters,
  TreeWorkerReturnType as TreeLayoutWorkerReturnType,
} from "./treeLayout.worker";

type WorkerModule = typeof import("./treeLayout.worker");

// vite-plugin-comlink rewrites `new ComlinkWorker(...)` into a statement ending
// in `;`, so it MUST sit on its own line (not inside an arrow/expression).
function spawnWorker() {
  const worker = new ComlinkWorker<WorkerModule>(
    new URL("./treeLayout.worker.ts", import.meta.url),
  );
  return worker;
}

const terminate = (w: ReturnType<typeof spawnWorker>) => w[endpointSymbol].terminate();

export const treeAsync = memoizee(
  (params: TreeLayoutWorkerParameters): Promise<TreeLayoutWorkerReturnType> =>
    withWorker("tree", spawnWorker, terminate, (w) => w.parse(params)),
  { async: true, length: 1 },
);

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
