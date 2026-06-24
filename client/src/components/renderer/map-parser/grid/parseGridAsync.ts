import { queryOptions } from "@tanstack/react-query";
import { queryClient } from "query";
import { endpointSymbol } from "vite-plugin-comlink/symbol";
import { withWorker } from "workers/workerLanes";
import { ParseGridWorkerParameters, ParseGridWorkerReturnType } from "./parseGrid.worker";

type WorkerModule = typeof import("./parseGrid.worker");

// vite-plugin-comlink rewrites `new ComlinkWorker(...)` into a statement ending
// in `;`, so it MUST sit on its own line (not inside an arrow/expression).
function spawnWorker() {
  const worker = new ComlinkWorker<WorkerModule>(
    new URL("./parseGrid.worker.ts", import.meta.url),
  );
  return worker;
}

const terminate = (w: ReturnType<typeof spawnWorker>) => w[endpointSymbol].terminate();

export const parseGridQuery = (params: ParseGridWorkerParameters) =>
  queryOptions({
    queryKey: ["map-parser/grid", params],
    queryFn: ({ signal }): Promise<ParseGridWorkerReturnType> =>
      withWorker("map-parse", spawnWorker, terminate, (w) => w.parseGrid(params), { signal }),
    staleTime: Infinity,
  });

/** Direct (non-React) entry point; shares the React Query cache + dedup. */
export const parseGridAsync = (params: ParseGridWorkerParameters) =>
  queryClient.fetchQuery(parseGridQuery(params));
