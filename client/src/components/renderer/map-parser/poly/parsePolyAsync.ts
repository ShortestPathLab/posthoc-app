import memoizee from "memoizee";
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

export const parsePolyAsync = memoizee(
  (params: ParsePolyWorkerParameters): Promise<ParsePolyWorkerReturnType> =>
    withWorker("map-parse", spawnWorker, terminate, (w) => w.parsePoly(params)),
  { async: true, length: 1 },
);
