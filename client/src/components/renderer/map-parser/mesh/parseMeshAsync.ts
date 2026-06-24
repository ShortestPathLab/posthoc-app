import { queryOptions } from "@tanstack/react-query";
import { queryClient } from "query";
import { endpointSymbol } from "vite-plugin-comlink/symbol";
import { withWorker } from "workers/workerLanes";
import { ParseMeshWorkerParameters, ParseMeshWorkerReturnType } from "./parseMesh.worker";

type WorkerModule = typeof import("./parseMesh.worker");

// vite-plugin-comlink rewrites `new ComlinkWorker(...)` into a statement ending
// in `;`, so it MUST sit on its own line (not inside an arrow/expression).
function spawnWorker() {
  const worker = new ComlinkWorker<WorkerModule>(
    new URL("./parseMesh.worker.ts", import.meta.url),
  );
  return worker;
}

const terminate = (w: ReturnType<typeof spawnWorker>) => w[endpointSymbol].terminate();

export const parseMeshQuery = (params: ParseMeshWorkerParameters) =>
  queryOptions({
    queryKey: ["map-parser/mesh", params],
    queryFn: ({ signal }): Promise<ParseMeshWorkerReturnType> =>
      withWorker("map-parse", spawnWorker, terminate, (w) => w.parseMesh(params), { signal }),
    staleTime: Infinity,
  });

/** Direct (non-React) entry point; shares the React Query cache + dedup. */
export const parseMeshAsync = (params: ParseMeshWorkerParameters) =>
  queryClient.fetchQuery(parseMeshQuery(params));
