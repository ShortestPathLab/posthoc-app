import { queryOptions, useQuery } from "@tanstack/react-query";
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

export type TreeLayoutOptions = TreeLayoutWorkerParameters & { key?: string };

export const treeLayoutQuery = ({ key, mode, orientation, step, trace }: TreeLayoutOptions) =>
  queryOptions({
    queryKey: ["compute/tree/layout", key, mode, orientation, step],
    // React Query's `signal` aborts the lease (terminating the worker) if the
    // query is cancelled — e.g. the key changes before this resolves.
    queryFn: ({ signal }): Promise<TreeLayoutWorkerReturnType> =>
      withWorker("tree", spawnWorker, terminate, (w) => w.parse({ mode, orientation, step, trace }), {
        signal,
      }),
    enabled: !!key,
    staleTime: Infinity,
  });

export function useTreeLayout(options: TreeLayoutOptions) {
  return useQuery(treeLayoutQuery(options));
}
