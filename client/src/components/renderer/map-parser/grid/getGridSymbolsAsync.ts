import { endpointSymbol } from "vite-plugin-comlink/symbol";
import { withWorker } from "workers/workerLanes";
import { GetGridSymbolsParameters, GetGridSymbolsReturnType } from "./getGridSymbols.worker";

type WorkerModule = typeof import("./getGridSymbols.worker");

// vite-plugin-comlink rewrites `new ComlinkWorker(...)` into a statement ending
// in `;`, so it MUST sit on its own line (not inside an arrow/expression).
function spawnWorker() {
  const worker = new ComlinkWorker<WorkerModule>(
    new URL("./getGridSymbols.worker.ts", import.meta.url),
  );
  return worker;
}

const terminate = (w: ReturnType<typeof spawnWorker>) => w[endpointSymbol].terminate();

export const getGridSymbolsAsync = (
  params: GetGridSymbolsParameters,
): Promise<GetGridSymbolsReturnType> =>
  withWorker("map-parse", spawnWorker, terminate, (w) => w.getGridSymbols(params));
