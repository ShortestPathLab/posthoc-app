import { queryOptions } from "@tanstack/react-query";
import { queryClient } from "query";
import { endpointSymbol } from "vite-plugin-comlink/symbol";
import { withWorker } from "workers/workerLanes";
import { ParseNetworkWorkerParameters, ParseNetworkWorkerReturnType } from "./parseNetwork.worker";

type WorkerModule = typeof import("./parseNetwork.worker");

// vite-plugin-comlink rewrites `new ComlinkWorker(...)` into a statement ending
// in `;`, so it MUST sit on its own line (not inside an arrow/expression).
function spawnWorker() {
  const worker = new ComlinkWorker<WorkerModule>(
    new URL("./parseNetwork.worker.ts", import.meta.url),
  );
  return worker;
}

const terminate = (w: ReturnType<typeof spawnWorker>) => w[endpointSymbol].terminate();

export const parseNetworkQuery = (params: ParseNetworkWorkerParameters) =>
  queryOptions({
    queryKey: ["map-parser/network", params],
    queryFn: ({ signal }): Promise<ParseNetworkWorkerReturnType> =>
      withWorker("map-parse", spawnWorker, terminate, (w) => w.parseNetwork(params), { signal }),
    staleTime: Infinity,
  });

/** Direct (non-React) entry point; shares the React Query cache + dedup. */
export const parseNetworkAsync = (params: ParseNetworkWorkerParameters) =>
  queryClient.fetchQuery(parseNetworkQuery(params));
