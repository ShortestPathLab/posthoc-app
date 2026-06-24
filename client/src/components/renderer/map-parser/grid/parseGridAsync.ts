import memoizee from "memoizee";
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

export const parseGridAsync = memoizee(
  (params: ParseGridWorkerParameters): Promise<ParseGridWorkerReturnType> =>
    withWorker("map-parse", spawnWorker, terminate, (w) => w.parseGrid(params)),
  { async: true, length: 1 },
);
