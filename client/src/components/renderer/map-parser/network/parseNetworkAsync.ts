import memoizee from "memoizee";
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

export const parseNetworkAsync = memoizee(
  (params: ParseNetworkWorkerParameters): Promise<ParseNetworkWorkerReturnType> =>
    withWorker("map-parse", spawnWorker, terminate, (w) => w.parseNetwork(params)),
  { async: true, length: 1 },
);
