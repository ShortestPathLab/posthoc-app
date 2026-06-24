import { queryOptions } from "@tanstack/react-query";
import { queryClient } from "query";
import { endpointSymbol } from "vite-plugin-comlink/symbol";
import { withWorker } from "workers/workerLanes";
import { ParsePolyWorkerParameters, ParsePolyWorkerReturnType } from "./parsePoly.worker";

type WorkerModule = typeof import("./parsePoly.worker");

// vite-plugin-comlink rewrites `new ComlinkWorker(...)` into a statement ending
// in `;`, so it MUST sit on its own line (not inside an arrow/expression).
function spawnWorker() {
  const worker = new ComlinkWorker<WorkerModule>(
    new URL("./parsePoly.worker.ts", import.meta.url),
  );
  return worker;
}

const terminate = (w: ReturnType<typeof spawnWorker>) => w[endpointSymbol].terminate();

export const parsePolyQuery = (params: ParsePolyWorkerParameters) =>
  queryOptions({
    queryKey: ["map-parser/poly", params],
    queryFn: ({ signal }): Promise<ParsePolyWorkerReturnType> =>
      withWorker("map-parse", spawnWorker, terminate, (w) => w.parsePoly(params), { signal }),
    staleTime: Infinity,
  });

/** Direct (non-React) entry point; shares the React Query cache + dedup. */
export const parsePolyAsync = (params: ParsePolyWorkerParameters) =>
  queryClient.fetchQuery(parsePolyQuery(params));
