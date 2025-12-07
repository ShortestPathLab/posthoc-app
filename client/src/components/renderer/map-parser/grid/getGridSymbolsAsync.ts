import { usingWorkerTask } from "workers/usingWorker";
import {
  GetGridSymbolsParameters,
  GetGridSymbolsReturnType,
} from "./getGridSymbols.worker";

export const GetGridSymbolsWorker = () =>
  new Worker("./getGridSymbols.worker.ts", { type: "module" });

export const getGridSymbolsAsync = usingWorkerTask<
  GetGridSymbolsParameters,
  GetGridSymbolsReturnType
>(GetGridSymbolsWorker);
